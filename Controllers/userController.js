import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/Error.js";
import bcryptjs from "bcryptjs";
import Products from "../Models/productsModel.js";
import Cart from "../Models/cartModel.js";
import Stripe from "stripe";
import Orders from "../Models/ordersModel.js";

export const updateUser = async (req, res, next) => {
  const { id } = req.params;
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
    return next(errorHandler(500, error));
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
    return next(errorHandler(500, error));
  }
};

export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      next(errorHandler(404, "User not found."));
    }
    res.status(200).json({ message: "Fetched user successfully.", user });
  } catch (error) {
    return next(errorHandler(error));
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
    return next(errorHandler(500, error));
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, userId } = req.body;

    if (!productId) {
      return next(errorHandler(400, "Product ID is required"));
    }

    const cart = await Cart.findOne({ userId });

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
        cart.products.push({ productId, quantity: 1 });
      }

      await cart.save();
    } else {
      // Create a new cart if one does not exist
      await Cart.create({
        userId,
        products: [{ productId, quantity: 1 }],
      });
    }

    return res
      .status(200)
      .json({ message: "Product added to cart successfully" });
  } catch (error) {
    return next(errorHandler(500, "Something went wrong"));
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId: id });

    if (!cart) {
      return res.status(401).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    if (cart.products.length === 0) {
      try {
        await Cart.deleteOne(cart);
      } catch (error) {
        next(errorHandler(500, `Unable to delete cart : ${error.message}`));
      }
    }

    return res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    return next(errorHandler(500, "Failed to remove product from cart"));
  }
};

export const getCartDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findOne({ userId: id }).populate(
      "products.productId"
    );

    if (!cart || cart.products.length === 0) {
      return res.status(200).json({ cartItems: [], subtotal: 0 });
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
    return next(errorHandler(500, "Failed to fetch cart details"));
  }
};

export const updateCartQuantity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return next(errorHandler(400, "Quantity must be at least 1"));
    }

    const cart = await Cart.findOne({ userId: id });

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
    return next(errorHandler(500, "Failed to update cart quantity"));
  }
};

export const checkoutSession = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const { products, user } = req.body;

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name:
            product.productName ||
            product.name ||
            product.productId.productName,
          images: [
            product.images?.[0] ||
              product.picture?.[0] ||
              product.productId.images?.[0],
          ],
          metadata: {
            product_id: product.id.toString(),
          },
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "https://loot-mart.netlify.app/paymentsuccess",
      cancel_url: "https://loot-mart.netlify.app/paymentfailure",
      client_reference_id: user._id,
      expand: ["line_items"],
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    return next(errorHandler(500, "Payment Failed"));
  }
};

export const stripeWebhook = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (error) {
    return next(errorHandler(400, error.message));
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      const enrichedProducts = await Promise.all(
        lineItems.data.map(async (item) => {
          const product = await stripe.products.retrieve(item.price.product);
          return {
            productId: product.metadata.product_id,
            quantity: item.quantity,
            price: item.price.unit_amount / 100,
          };
        })
      );

      const userId = session.client_reference_id;
      const customer = await User.findById(userId);

      if (!customer) {
        return next(errorHandler(404, "User not found"));
      }

      const orderDetails = new Orders({
        userId,
        products: enrichedProducts,
        totalAmount: session.amount_total / 100,
        paymentStatus: "Paid",
        status: "Pending",
      });

      await orderDetails.save();
      try {
        await Cart.findOneAndDelete({ userId });
      } catch (error) {
        next(errorHandler(500, "Error deleting cart items"));

        res.status(200).json({ message: "Order placed successfully" });
      }
    } catch (error) {
      return next(errorHandler(500, "Error procescsing the order"));
    }
  }
};

export const getOrderDetails = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    next(errorHandler(401, "User Id is missing"));
  }
  try {
    const orderDetails = await Orders.find({ userId: id }).populate({
      path: "products.productId",
      select: "productName description images price",
    });

    if (!orderDetails) {
      res.status(200).json({ message: "You have not placed orders yet" });
    }
    res
      .status(200)
      .json({ orderDetails, message: "Order details fetched successfully" });
  } catch (error) {
    return next(errorHandler(500, "Failed to fetch order details"));
  }
};
