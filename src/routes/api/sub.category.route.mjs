import { Router } from "express";
import subcategoryController from "../../modules/sub-category/sub.category.controller.mjs";

const subcategoryRouter = Router();


subcategoryRouter.get("/pages", subcategoryController.getSubCategorysByPagination);

subcategoryRouter
  .route("/:id")
  .get(subcategoryController.getSubCategory)
  .put(subcategoryController.updateSubCategory)
  .delete(subcategoryController.deleteSubCategory);

subcategoryRouter
  .route("/")
  .post(subcategoryController.createSubCategory)
  .get(subcategoryController.getSubCategorys)
 

export default subcategoryRouter;