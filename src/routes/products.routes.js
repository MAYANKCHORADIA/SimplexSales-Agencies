import { Router } from 'express';
import { viewAllProducts as adminViewAllProducts, getProductById as adminGetProductById } from '../controllers/admin.controller.js';
import { viewAllProducts, getProductById } from '../controllers/products.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes for users
router.get('/', viewAllProducts);
router.get('/:productId', getProductById);

// Admin routes (optional, protected) - reuse admin controllers if desired
router.get('/admin', verifyJWT, adminViewAllProducts);
router.get('/admin/:productId', verifyJWT, adminGetProductById);

export default router;
