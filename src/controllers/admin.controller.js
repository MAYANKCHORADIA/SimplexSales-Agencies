import User from '../models/users.model.js';
import QuotationRequest from '../models/QR.models.js';
import Product from '../models/Product.model.js';
import { sendEmail, sendSMS } from '../utils/notify.js';

function ensureAdmin(req) {
	const role = req.user?.role || req.userRole || null;
	return role === 'admin';
}

export async function viewAllUsers(req, res, next) {
	try {
		if (!ensureAdmin(req)) return res.status(403).json({ message: 'Forbidden' });

		const page = Math.max(1, parseInt(req.query.page || '1'));
		const limit = Math.max(1, parseInt(req.query.limit || '50'));
		const skip = (page - 1) * limit;

		const [users, total] = await Promise.all([
			User.find()
				.select('-password -refreshToken -forgotPasswordToken -emailVerificationToken')
				.skip(skip)
				.limit(limit)
				.lean(),
			User.countDocuments(),
		]);

		res.json({ users, total, page, limit });
	} catch (err) {
		next(err);
	}
}

export async function viewAllQuotationRequests(req, res, next) {
	try {
		if (!ensureAdmin(req)) return res.status(403).json({ message: 'Forbidden' });

		const qrs = await QuotationRequest.find()
			.populate('user', 'email phone fullName')
			.populate('product', 'name __id')
			.sort({ createdAt: -1 })
			.lean();

		res.json({ quotationRequests: qrs });
	} catch (err) {
		next(err);
	}
}

export async function respondToQuotationRequest(req, res, next) {
	try {
		if (!ensureAdmin(req)) return res.status(403).json({ message: 'Forbidden' });

		const { qrId } = req.params;
		const { adminResponse } = req.body;
		if (!adminResponse) return res.status(400).json({ message: 'adminResponse is required' });

		const qr = await QuotationRequest.findOne({ qrId }).populate('user');
		if (!qr) return res.status(404).json({ message: 'Quotation request not found' });

		qr.adminResponse = adminResponse;
		qr.status = 'responded';
		await qr.save();

		// notify user
		if (qr.user?.email) await sendEmail(qr.user.email, 'Quotation response', adminResponse);
		if (qr.user?.phone) await sendSMS(qr.user.phone, adminResponse);

		res.json({ message: 'Responded', quotationRequest: qr });
	} catch (err) {
		next(err);
	}
}

export async function viewAllProducts(req, res, next) {
	try {
		if (!ensureAdmin(req)) return res.status(403).json({ message: 'Forbidden' });

		const products = await Product.find().sort({ createdAt: -1 }).lean();
		res.json({ products });
	} catch (err) {
		next(err);
	}
}

export async function addProduct(req, res, next) {
	try {
		if (!ensureAdmin(req)) return res.status(403).json({ message: 'Forbidden' });

		const { name, images, description, price, sku, stock } = req.body;
		const p = await Product.create({ name, images, description, price, sku, stock });
		res.status(201).json({ product: p });
	} catch (err) {
		next(err);
	}
}

function findProductQuery(productId) {
	return { $or: [{ __id: productId }, { _id: productId }] };
}

export async function deleteProduct(req, res, next) {
	try {
		if (!ensureAdmin(req)) return res.status(403).json({ message: 'Forbidden' });

		const { productId } = req.params;
		const p = await Product.findOneAndDelete(findProductQuery(productId));
		if (!p) return res.status(404).json({ message: 'Product not found' });
		res.json({ message: 'Product deleted' });
	} catch (err) {
		next(err);
	}
}

export async function getProductById(req, res, next) {
	try {
		if (!ensureAdmin(req)) return res.status(403).json({ message: 'Forbidden' });

		const { productId } = req.params;
		const p = await Product.findOne(findProductQuery(productId)).lean();
		if (!p) return res.status(404).json({ message: 'Product not found' });
		res.json({ product: p });
	} catch (err) {
		next(err);
	}
}

export async function updateProduct(req, res, next) {
	try {
		if (!ensureAdmin(req)) return res.status(403).json({ message: 'Forbidden' });

		const { productId } = req.params;
		const updates = req.body;
		const p = await Product.findOneAndUpdate(findProductQuery(productId), updates, {
			new: true,
			runValidators: true,
		}).lean();
		if (!p) return res.status(404).json({ message: 'Product not found' });
		res.json({ product: p });
	} catch (err) {
		next(err);
	}
}

export default {
	viewAllUsers,
	viewAllQuotationRequests,
	respondToQuotationRequest,
	viewAllProducts,
	addProduct,
	deleteProduct,
	getProductById,
	updateProduct,
};
