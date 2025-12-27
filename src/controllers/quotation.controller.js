import QuotationRequest from '../models/QR.models.js';
import Product from '../models/Product.model.js';
import User from '../models/users.model.js';
import { sendEmail, sendSMS } from '../utils/notify.js';

export async function createQuotationRequest(req, res, next) {
  try {
    const userId = req.user?.id || req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { productId } = req.params;
    const { requestText } = req.body;
    if (!requestText || !requestText.trim()) return res.status(400).json({ message: 'requestText is required' });

    const product = await Product.findOne({ $or: [{ __id: productId }, { _id: productId }] });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const qr = await QuotationRequest.create({
      user: user._id,
      userName: user.fullName || user.BusinessName || '',
      product: product._id,
      productName: product.name,
      requestText: requestText.trim(),
    });

    // notify user (confirmation)
    const msg = `Your quotation request (${qr.qrId}) has been submitted for product ${product.name}.`;
    if (user.email) await sendEmail(user.email, 'Quotation request received', msg);
    if (user.phone) await sendSMS(user.phone, msg);

    res.status(201).json({ quotationRequest: qr });
  } catch (err) {
    next(err);
  }
}

export default { createQuotationRequest };
