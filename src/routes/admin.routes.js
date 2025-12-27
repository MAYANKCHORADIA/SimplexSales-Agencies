import { Router } from 'express';
import {
	viewAllUsers,
	viewAllQuotationRequests,
	respondToQuotationRequest,
	viewAllProducts,
	addProduct,
	deleteProduct,
	getProductById,
	updateProduct,
} from '../controllers/admin.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// Admin routes (all protected)
router.use(verifyJWT, isAdmin);

// Users
router.get('/users', viewAllUsers);

// Quotation requests
router.get('/quotations', viewAllQuotationRequests);
router.post('/quotations/:qrId/respond', respondToQuotationRequest);

// Products
router.get('/products', viewAllProducts);
router.post('/products', addProduct);
router.delete('/products/:productId', deleteProduct);
router.get('/products/:productId', getProductById);
router.put('/products/:productId', updateProduct);

export default router;
