import express from 'express';
import { verifyToken } from '../Middleware/verifyToken.js';
import { deleteUser, getUserById, updateUser } from '../Controllers/userController.js';

const router = express.Router()

router.put('/update/:id',verifyToken,updateUser);
router.delete('/delete/:id',verifyToken,deleteUser);
router.get('/get-user/:id',verifyToken,getUserById);

export default router;