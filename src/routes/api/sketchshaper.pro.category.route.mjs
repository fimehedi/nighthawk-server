import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import sketchShaperProCategoryController from "../../modules/sketchshaper-pro-category/sketchshaper.pro.category.controller.mjs";

const sketchShaperProCategoryRouter = Router();

// Get categories with pagination
sketchShaperProCategoryRouter.get("/pages", sketchShaperProCategoryController.getCategoriesByPagination);

// CRUD operations
sketchShaperProCategoryRouter
  .route("/:id")
  .get(sketchShaperProCategoryController.getCategory)
  .put(upload.any(), sketchShaperProCategoryController.updateCategory)
  .delete(sketchShaperProCategoryController.deleteCategory);

sketchShaperProCategoryRouter
  .route("/")
  .post(upload.any(), sketchShaperProCategoryController.createCategory)
  .get(sketchShaperProCategoryController.getCategories);

export default sketchShaperProCategoryRouter;
