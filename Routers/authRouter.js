import express from 'express';
import { registerUser } from '../Controllers/authController.js';


const router = express.Router();

router.post('/register-user',registerUser)

export default router;