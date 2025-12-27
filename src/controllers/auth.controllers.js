import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/users.model.js';
import { sendEmail, sendSMS } from '../utils/notify.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

function signAccessToken(payload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signRefreshToken(payload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

function genRandomToken() {
	return crypto.randomBytes(32).toString('hex');
}

export async function registerUser(req, res, next) {
	try {
		const { BusinessName, email, phone, password, fullName } = req.body;
		const existing = await User.findOne({ $or: [{ email }, { phone }] });
		if (existing) return res.status(409).json({ message: 'User already exists' });

		const hashed = await bcrypt.hash(password, 10);
		const emailVerificationToken = genRandomToken();
		const emailVerificationExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

		const user = await User.create({
			BusinessName,
			email,
			phone,
			password: hashed,
			fullName,
			emailVerificationToken,
			emailVerificationExpiry,
		});

		// Notify user
		const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
		await sendEmail(email, 'Verify your email', `Click to verify: ${verifyUrl}`);
		await sendSMS(phone, `Welcome! Verify your email: ${verifyUrl}`);

		const payload = { id: user._id, role: user.role };
		const accessToken = signAccessToken(payload);
		const refreshToken = signRefreshToken(payload);

		user.refreshToken = refreshToken;
		await user.save();

		const out = user.toObject();
		delete out.password;
		res.status(201).json({ user: out, accessToken, refreshToken });
	} catch (err) {
		next(err);
	}
}

export async function login(req, res, next) {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });

		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(401).json({ message: 'Invalid Password' });

		const payload = { id: user._id, role: user.role };
		const accessToken = signAccessToken(payload);
		const refreshToken = signRefreshToken(payload);

		user.refreshToken = refreshToken;
		await user.save();

		const out = user.toObject();
		delete out.password;
		res.json({ user: out, accessToken, refreshToken });
	} catch (err) {
		next(err);
	}
}

async function doLoginForRole(email, password, requiredRole = null) {
	const user = await User.findOne({ email });
	if (!user) throw { status: 401, message: 'Invalid credentials' };

	const match = await bcrypt.compare(password, user.password);
	if (!match) throw { status: 401, message: 'Invalid credentials' };

	if (requiredRole && user.role !== requiredRole) {
		throw { status: 403, message: 'Forbidden: incorrect role' };
	}

	const payload = { id: user._id, role: user.role };
	const accessToken = signAccessToken(payload);
	const refreshToken = signRefreshToken(payload);

	user.refreshToken = refreshToken;
	await user.save();

	const out = user.toObject();
	delete out.password;
	return { user: out, accessToken, refreshToken };
}

export async function loginUser(req, res, next) {
	try {
		const { email, password } = req.body;
		const result = await doLoginForRole(email, password, 'user');
		res.json(result);
	} catch (err) {
		if (err && err.status) return res.status(err.status).json({ message: err.message });
		next(err);
	}
}

export async function loginAdmin(req, res, next) {
	try {
		const { email, password } = req.body;
		const result = await doLoginForRole(email, password, 'admin');
		res.json(result);
	} catch (err) {
		if (err && err.status) return res.status(err.status).json({ message: err.message });
		next(err);
	}
}
export async function logoutUser(req, res, next) {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) return res.status(401).end();
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.refreshToken = undefined;
        await user.save();
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
}
export async function refreshAccessToken(req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
        const payload = verifyRefreshToken(refreshToken);
        const user = await User.findById(payload.id);
        if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ message: 'Invalid refresh token' });

        const newAccess = signAccessToken({ id: user._id, role: user.role });
        const newRefresh = signRefreshToken({ id: user._id, role: user.role });
        user.refreshToken = newRefresh;
        await user.save();

        res.json({ accessToken: newAccess, refreshToken: newRefresh });
    } catch (err) {
        next(err);
    }
}
export async function forgotPasswordRequest(req, res, next) {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(200).json({ message: 'If that account exists, you will receive reset instructions' });

		const token = genRandomToken();
		user.forgotPasswordToken = token;
		user.forgotPasswordExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
		await user.save();

		const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${token}`;
		await sendEmail(user.email, 'Reset your password', `Reset link: ${resetUrl}`);
		await sendSMS(user.phone, `Reset your password: ${resetUrl}`);

		res.json({ message: 'If that account exists, you will receive reset instructions' });
	} catch (err) {
		next(err);
	}
}

export async function resetForgotPassword(req, res, next) {
	try {
		const { resetToken } = req.params;
		const { password } = req.body;
		const user = await User.findOne({ forgotPasswordToken: resetToken, forgotPasswordExpiry: { $gt: new Date() } });
		if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

		user.password = await bcrypt.hash(password, 10);
		user.forgotPasswordToken = undefined;
		user.forgotPasswordExpiry = undefined;
		await user.save();

		res.json({ message: 'Password reset successful' });
	} catch (err) {
		next(err);
	}
}

export async function verifyEmail(req, res, next) {
	try {
		const { verificationToken } = req.params;
		const user = await User.findOne({ emailVerificationToken: verificationToken, emailVerificationExpiry: { $gt: new Date() } });
		if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpiry = undefined;
		await user.save();

		res.json({ message: 'Email verified' });
	} catch (err) {
		next(err);
	}
}

export async function resendEmailVerification(req, res, next) {
	try {
		const userId = req.user?.id || req.userId;
		if (!userId) return res.status(401).end();
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: 'User not found' });

		const token = genRandomToken();
		user.emailVerificationToken = token;
		user.emailVerificationExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24);
		await user.save();

		const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${token}`;
		await sendEmail(user.email, 'Verify your email', `Click to verify: ${verifyUrl}`);

		res.json({ message: 'Verification email sent' });
	} catch (err) {
		next(err);
	}
}

export async function getCurrentUser(req, res, next) {
	try {
		const userId = req.user?.id || req.userId;
		if (!userId) return res.status(401).end();
		const user = await User.findById(userId).select('-password -refreshToken -forgotPasswordToken -emailVerificationToken');
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json({ user });
	} catch (err) {
		next(err);
	}
}

export async function changeCurrentPassword(req, res, next) {
	try {
		const userId = req.user?.id || req.userId;
		const { currentPassword, newPassword } = req.body;
		if (!userId) return res.status(401).end();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: 'User not found' });

		const match = await bcrypt.compare(currentPassword, user.password);
		if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		res.json({ message: 'Password changed' });
	} catch (err) {
		next(err);
	}
}
