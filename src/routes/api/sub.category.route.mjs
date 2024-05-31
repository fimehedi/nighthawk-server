import { Router } from "express";
import subcategoryController from "../../modules/sub-category/sub.category.controller.mjs";

const subcategoryRouter = Router();


subcategoryRouter.get("/pages", subcategoryController.getSubCategorysByPagination);

subcategoryRouter
  .route("/:id")
  .get(subcategoryController.getSubCategorys)
  .put(subcategoryController.updateSubCategory);

subcategoryRouter
  .route("/")
  .post(subcategoryController.createSubCategory)
  .get(subcategoryController.getSubCategorys)
  .delete(subcategoryController.deleteSubCategory);

export default subcategoryRouter;