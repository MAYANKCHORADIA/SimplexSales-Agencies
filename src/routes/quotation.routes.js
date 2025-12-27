import { Router } from 'express';
import { body } from 'express-validator';
import { createQuotationRequest } from '../controllers/quotation.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validator.middleware.js';

const router = Router();

// Create a quotation request for a specific product (authenticated users)
router.post(
	'/products/:productId/quotations',
	verifyJWT,
	body('requestText').trim().notEmpty().withMessage('requestText is required'),
	validate,
	createQuotationRequest,
);

export default router;
