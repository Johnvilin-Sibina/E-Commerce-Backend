import express from 'express';
import { verifyToken } from '../Middleware/verifyToken.js';
import { createCategory } from '../Controllers/adminController.js';

const router = express.Router()

router.post('/create-category',verifyToken,createCategory);


export default router