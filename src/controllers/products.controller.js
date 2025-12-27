import Product from '../models/Product.model.js';

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

export default { viewAllProducts, getProductById };
