import catchError from "../../middlewares/errors/catchError.mjs";
import responseHandler from "../../utils/responseHandler.mjs";
import sketchShaperProCategoryService from "./sketchshaper.pro.category.service.mjs";

class SketchShaperProCategoryController {
  createCategory = catchError(async (req, res, next) => {
    const category = await sketchShaperProCategoryService.createCategory({
      ...req.body,
      files: req.files,
    });
    const resDoc = responseHandler(201, "Category created successfully", category);
    res.status(201).json(resDoc);
  });

  updateCategory = catchError(async (req, res, next) => {
    const category = await sketchShaperProCategoryService.updateCategory(req.params.id, {
      ...req.body,
      files: req.files,
    });
    const resDoc = responseHandler(200, "Category updated successfully", category);
    res.status(200).json(resDoc);
  });

  getCategories = catchError(async (req, res, next) => {
    const categories = await sketchShaperProCategoryService.getCategories();
    const resDoc = responseHandler(200, "Categories retrieved successfully", categories);
    res.status(200).json(resDoc);
  });

  getCategoriesByPagination = catchError(async (req, res, next) => {
    const { page, limit, order } = req.query;
    const categories = await sketchShaperProCategoryService.getCategoriesByPagination({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      order 
    });
    const resDoc = responseHandler(200, "Categories retrieved successfully", categories);
    res.status(200).json(resDoc);
  });

  getCategory = catchError(async (req, res, next) => {
    const { id } = req.params;
    
    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Category ID is required'
      });
    }
    
    const category = await sketchShaperProCategoryService.getCategory(id);
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Category not found'
      });
    }
    
    const resDoc = responseHandler(200, "Category retrieved successfully", category);
    res.status(200).json(resDoc);
  });

  deleteCategory = catchError(async (req, res, next) => {
    await sketchShaperProCategoryService.deleteCategory(req.params.id);
    const resDoc = responseHandler(200, "Category deleted successfully");
    res.status(200).json(resDoc);
  });
}

export default new SketchShaperProCategoryController();
