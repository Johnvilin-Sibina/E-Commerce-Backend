import mongoose from "mongoose";

const productsSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      trim: true,
    },
    stock: {
      type: Number,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const Products = mongoose.model("Products", productsSchema);

export default Products;
