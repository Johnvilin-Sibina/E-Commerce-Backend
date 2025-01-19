import express from 'express';
import { verifyToken } from '../Middleware/verifyToken.js';
import { createCategory, createProduct } from '../Controllers/adminController.js';

const router = express.Router()

router.post('/create-category',verifyToken,createCategory);
router.post('/create-product',verifyToken,createProduct);


export default router