import Category from "../Models/categoriesModel.js";
import { errorHandler } from "../Utils/Error.js";

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
    next(error);
  }
};
