import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import subcategoryController from "../../modules/sub-category/sub.category.controller.mjs";

const subcategoryRouter = Router();


subcategoryRouter.get("/pages", subcategoryController.getSubCategorysByPagination);

subcategoryRouter
  .route("/:id")
  .get(subcategoryController.getSubCategory)
  .put(upload.any(), subcategoryController.updateSubCategory)
  .delete(subcategoryController.deleteSubCategory);

subcategoryRouter
  .route("/")
  .post(upload.any(), subcategoryController.createSubCategory)
  .get(subcategoryController.getSubCategorys);


export default subcategoryRouter;