import { Router } from 'express';
import multer from 'multer';
import { viewAllProducts as adminViewAllProducts, getProductById as adminGetProductById } from '../controllers/admin.controller.js';
import { viewAllProducts, getProductById, createProduct, updateProduct } from '../controllers/products.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// multer setup: store files in memory, we'll stream to Cloudinary
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes for users
router.get('/', viewAllProducts);
router.get('/:productId', getProductById);

// Admin routes (protected)
router.get('/admin', verifyJWT, adminViewAllProducts);
router.get('/admin/:productId', verifyJWT, adminGetProductById);

// Create product (admin) - accept multiple images in `images` field
router.post('/admin', verifyJWT, upload.array('images', 6), createProduct);

// Update product (admin) - can append images
router.put('/admin/:productId', verifyJWT, upload.array('images', 6), updateProduct);

export default router;
