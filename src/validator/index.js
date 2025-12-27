import { body } from 'express-validator';

const phoneRegex = /^\+91[6-9]\d{9}$/;

export function userRegisterValidator() {
	return [
		body('BusinessName').isString().trim().notEmpty().withMessage('BusinessName is required'),
		body('email').isEmail().withMessage('Valid email is required'),
		body('phone')
			.matches(phoneRegex)
			.withMessage('Phone must be a valid Indian number with +91'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
		body('fullName').optional().isString().trim(),
	];
}

export function userLoginValidator() {
	return [
		body('email').isEmail().withMessage('Valid email is required'),
		body('password').notEmpty().withMessage('Password is required'),
	];
}

export function userForgotPasswordValidator() {
	return [body('email').isEmail().withMessage('Valid email is required')];
}

export function userResetForgotPasswordValidator() {
	return [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')];
}

export function userChangeCurrentPasswordValidator() {
	return [
		body('currentPassword').notEmpty().withMessage('Current password is required'),
		body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
	];
}

export default {
	userRegisterValidator,
	userLoginValidator,
	userForgotPasswordValidator,
	userResetForgotPasswordValidator,
	userChangeCurrentPasswordValidator,
};

