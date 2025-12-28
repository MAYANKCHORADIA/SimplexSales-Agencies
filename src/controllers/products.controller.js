import Product from '../models/Product.model.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';

function findProductQuery(productId) {
	return { $or: [{ __id: productId }, { _id: productId }] };
}

export async function viewAllProducts(req, res, next) {
	try {
		const page = Math.max(1, parseInt(req.query.page || '1'));
		const limit = Math.max(1, parseInt(req.query.limit || '20'));
		const skip = (page - 1) * limit;

		// optional simple search by name
		const q = {};
		if (req.query.q) {
			q.name = { $regex: req.query.q, $options: 'i' };
		}

		const [products, total] = await Promise.all([
			Product.find(q).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
			Product.countDocuments(q),
		]);

		res.json({ products, total, page, limit });
	} catch (err) {
		next(err);
	}
}

export async function getProductById(req, res, next) {
	try {
		const { productId } = req.params;
		const product = await Product.findOne(findProductQuery(productId)).lean();
		if (!product) return res.status(404).json({ message: 'Product not found' });
		res.json({ product });
	} catch (err) {
		next(err);
	}
}

// Admin: create product and upload images to Cloudinary
export async function createProduct(req, res, next) {
	try {
		const { name, description = '', price, sku, stock } = req.body;

		if (!name) return res.status(400).json({ message: 'Product name is required' });

		const images = [];

		// handle files uploaded via multer memoryStorage (req.files)
		const files = Array.isArray(req.files) ? req.files : (req.files?.images || []);

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (!file || !file.buffer) continue;

			// upload to cloudinary
			const folder = process.env.CLOUDINARY_FOLDER || 'simplex-sales/products';
			const pubOptions = { folder };
			const result = await uploadBufferToCloudinary(file.buffer, pubOptions);
			images.push({ url: result.secure_url, alt: file.originalname || '' });
		}

		const product = new Product({ name, description, price, sku, stock, images });
		await product.save();
		res.status(201).json({ product });
	} catch (err) {
		next(err);
	}
}

// Admin: update product (allows adding images)
export async function updateProduct(req, res, next) {
	try {
		const { productId } = req.params;
		const update = { ...req.body };

		const product = await Product.findOne(findProductQuery(productId));
		if (!product) return res.status(404).json({ message: 'Product not found' });

		// If files provided, upload and append
		const files = Array.isArray(req.files) ? req.files : (req.files?.images || []);
		if (files && files.length) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (!file || !file.buffer) continue;
				const folder = process.env.CLOUDINARY_FOLDER || 'simplex-sales/products';
				const result = await uploadBufferToCloudinary(file.buffer, { folder });
				product.images.push({ url: result.secure_url, alt: file.originalname || '' });
			}
		}

		// apply other updates
		Object.keys(update).forEach((k) => {
			if (k === 'images') return; // skip images from body
			product[k] = update[k];
		});

		await product.save();
		res.json({ product });
	} catch (err) {
		next(err);
	}
}

export default { viewAllProducts, getProductById, createProduct, updateProduct };
