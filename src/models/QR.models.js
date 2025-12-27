import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const qrSchema = new Schema(
    {
        qrId: {
            type: String,
            unique: true,
            required: true,
            default: () => `QR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userName: {
            type: String,
            trim: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: {
            type: String,
            trim: true,
        },
        requestText: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'responded', 'closed'],
            default: 'pending',
        },
        adminResponse: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Optional: create a compact index to speed up queries by user and status
qrSchema.index({ user: 1, status: 1 });

const QuotationRequest = mongoose.model('QuotationRequest', qrSchema);

export default QuotationRequest;