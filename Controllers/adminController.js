import Category from "../Models/categoriesModel.js";
import { errorHandler } from "../Utils/Error.js";
import Products from "../Models/productsModel.js";

export const createCategory = async (req, res, next) => {
  const { categoryName, description } = req.body;
  if (
    !categoryName ||
    !description ||
    categoryName === "" ||
    description === ""
  ) {
    return next(errorHandler(400, "All the fields are required"));
  }
  const newCategory = new Category({ categoryName, description });
  try {
    await newCategory.save();
    res
      .status(200)
      .json({ message: "Category created successfully", newCategory });
  } catch (error) {
    return next(errorHandler(error));
  }
};

export const createProduct = async (req, res, next) => {
  const { productName, description, price, category, stock, images } = req.body;
  if (
    !productName ||
    !description ||
    !price ||
    !stock ||
    !category ||
    !images
  ) {
    return next(errorHandler(400, "All the fields are required"));
  }
  const productCategory = await Category.findOne({ categoryName: category });
  if (!productCategory) {
    return next(errorHandler(404, "Invalid Category"));
  }
  const newProduct = new Products({
    productName,
    description,
    price,
    stock,
    category: productCategory._id,
    images,
  });
  try {
    await newProduct.save();
    res.status(200).json({ message: "Product added successfully", newProduct });
  } catch (error) {
    return next(errorHandler(error));
  }
};
