import express from 'express';
import { verifyToken } from '../Middleware/verifyToken.js';
import { addToCart, checkoutSession, deleteUser, getCartCount, getCartDetails, getProducts, getUserById, removeFromCart, updateCartQuantity, updateUser } from '../Controllers/userController.js';

const router = express.Router()

router.put('/update/:id',verifyToken,updateUser);
router.delete('/delete/:id',verifyToken,deleteUser);
router.get('/get-user/:id',verifyToken,getUserById);
router.get('/get-products',getProducts);
router.post('/add-to-cart',verifyToken,addToCart);
router.get("/cart-count/:id", verifyToken, getCartCount);
router.get("/cart-details/:id", verifyToken, getCartDetails);
router.post("/update-cart-quantity/:id", verifyToken, updateCartQuantity);
router.post("/remove-from-cart/:id", verifyToken, removeFromCart);
router.post('/create-checkout-session',verifyToken,checkoutSession)

export default router;