import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import sketchShaperProCategoryController from "../../modules/sketchshaper-pro-category/sketchshaper.pro.category.controller.mjs";

const sketchShaperProCategoryRouter = Router();

// CRUD operations
sketchShaperProCategoryRouter
  .route("/")
  .post(upload.any(), sketchShaperProCategoryController.createCategory)
  .get(sketchShaperProCategoryController.getCategories);

// Get categories with pagination (must come before /:id route)
sketchShaperProCategoryRouter.get("/pages", sketchShaperProCategoryController.getCategoriesByPagination);

sketchShaperProCategoryRouter
  .route("/:id")
  .get(sketchShaperProCategoryController.getCategory)
  .put(upload.any(), sketchShaperProCategoryController.updateCategory)
  .delete(sketchShaperProCategoryController.deleteCategory);

export default sketchShaperProCategoryRouter;
