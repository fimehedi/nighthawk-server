import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import categoryController from "../../modules/category/category.controller.mjs";

const categoryRouter = Router();

categoryRouter.get("/pages", categoryController.getCategorysByPagination);

categoryRouter
  .route("/:id")
  .get(categoryController.getCategory)
  .put(upload.any(), categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

categoryRouter
  .route("/")
  .post(upload.any(), categoryController.createCategory)
  .get(categoryController.getCategorys);


export default categoryRouter;