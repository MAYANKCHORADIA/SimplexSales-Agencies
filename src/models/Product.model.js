import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema(
	{
		__id: {
			type: String,
			unique: true,
			required: true,
			default: () => `P-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
		},
		name: {
			type: String,
			required: [true, 'Product name is required'],
			trim: true,
			index: true,
		},
		images: [
			{
				url: { type: String, required: true },
				alt: { type: String, default: '' },
			},
		],
		description: {
			type: String,
			trim: true,
			default: '',
		},
		price: {
			type: Number,
			required: false,
			min: 0,
		},
		sku: {
			type: String,
		},
		stock: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{ timestamps: true }
);

productSchema.index({ __id: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

