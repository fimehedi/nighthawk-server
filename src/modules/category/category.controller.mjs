import catchError from "../../middlewares/errors/catchError.mjs";
import responseHandler from "../../utils/responseHandler.mjs";
import categoryService from "./category.service.mjs";

class CategoryController {
  createCategory = catchError(async (req, res, next) => {

    const category = await categoryService.createCategory(req.body);
    const resDoc = responseHandler(201, "Category created successfully", category);
    res.status(201).json(resDoc);
  });

  updateCategory = catchError(async (req, res, next) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    const resDoc = responseHandler(200, "Category updated successfully", category);
    res.status(200).json(resDoc);
  });

  getCategorys = catchError(async (req, res, next) => {
    const categorys = await categoryService.getCategorys();
    const resDoc = responseHandler(200, "Categorys retrieved successfully", categorys);
    res.status(200).json(resDoc);
  });


  getCategory = catchError(async (req, res, next) => {
    const category = await categoryService.getCategory(req.params.id);
    const resDoc = responseHandler(200, "Category retrieved successfully", category);
    res.status(200).json(resDoc);
  });

  deleteCategory = catchError(async (req, res, next) => {
    await categoryService.deleteCategory(req.params.id);
    const resDoc = responseHandler(200, "Category deleted successfully");
    res.status(200).json(resDoc);
  });
}

export default new CategoryController();