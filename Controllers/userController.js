import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/Error.js";
import bcryptjs from "bcryptjs";
import Products from "../Models/productsModel.js";
import Cart from '../Models/cartModel.js';

export const updateUser = async (req, res, next) => {
  const { id } = req.params;
  console.log(req.body);
  if (req.user.id != id) {
    return next(errorHandler(401, "Unauthorized access to update the user"));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, "Password must be atleast 6 characters"));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
    if (req.body.username.length < 8 || req.body.username.length > 16) {
      return next(
        errorHandler(400, "Username must be between 8 and 16 characters")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username must not contain spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[A-Za-z0-9 ]+$/)) {
      return next(
        errorHandler(400, "Usename can only contain alphabet and numbers")
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
          address: req.body.address,
          phoneNumber: req.body.phoneNumber,
        },
      },
      {
        new: true,
      }
    );
    const { password, ...rest } = updatedUser._doc;
    res
      .status(200)
      .json({ message: "User Profile Updated Successfully", rest });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id != req.params.id) {
    return next(
      errorHandler(401, "You are not allowed to delete this account.")
    );
  }
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User account deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  try {
    const user = await User.findById(id);
    if (!user) {
      next(errorHandler(404, "User not found."));
    }
    res.status(200).json({ message: "Fetched user successfully.", user });
    console.log(user);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await Products.find();
    if (!products) {
      next(errorHandler(400, "Failed to fetch products"));
    }
    res
        .status(200)
        .json({ message: "Products fetched successfully", products });
  } catch (error) {
    return next(error);
  }
};


export const addToCart = async (req, res, next) => {
  try {
    const { productId, userId } = req.body; 

    if (!productId) {
      return next(errorHandler(400, "Product ID is required"));
    }

    const cart = await Cart.findOne({userId});

    if (cart) {
      // Check if the product already exists in the cart
      const productIndex = cart.products.findIndex(
        (product) => product.productId.toString() === productId
      );

      if (productIndex > -1) {
        // If product exists, increment quantity
        cart.products[productIndex].quantity += 1;
      } else {
        // If product does not exist, add it
        cart.products.push({productId, quantity: 1 });
      }

      await cart.save();
    } else {
      // Create a new cart if one does not exist
      await Cart.create({
        userId,
        products: [{ productId, quantity: 1 }],
      });
    }

    return res.status(200).json({ message: "Product added to cart successfully" });
  } catch (error) {
    next(errorHandler(500, "Something went wrong"));
  }
};

export const getCartCount = async (req, res, next) => {
  try {
    const {id} = req.params
    const cart = await Cart.findOne({ userId:id });

    const itemCount = cart ? cart.products.reduce((count, item) => count + item.quantity, 0) : 0;

    return res.status(200).json({ itemCount });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch cart count"));
  }
};

export const getCartDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findOne({ userId: id }).populate("products.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cartItems = cart.products.map((item) => ({
      id: item.productId._id,
      name: item.productId.productName,
      description: item.productId.description,
      picture: item.productId.images,
      price: item.productId.price,
      quantity: item.quantity,
      totalPrice: item.productId.price * item.quantity,
    }));

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    res.status(200).json({ cartItems, subtotal });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch cart details"));
  }
};


export const updateCartQuantity = async (req, res, next) => {
  try {
    const {id} = req.params
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return next(errorHandler(400, "Quantity must be at least 1"));
    }

    const cart = await Cart.findOne({ userId:id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return next(errorHandler(404, "Product not found in cart"));
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    return res
      .status(200)
      .json({ message: "Cart quantity updated successfully" });
  } catch (error) {
    next(errorHandler(500, "Failed to update cart quantity"));
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const {id} = req.params
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId:id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();

    return res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    next(errorHandler(500, "Failed to remove product from cart"));
  }
};

