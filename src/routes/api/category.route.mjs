import { Router } from "express";
import categoryController from "../../modules/category/category.controller.mjs";

const categoryRouter = Router();

categoryRouter.get("/pages", categoryController.getCategorysByPagination);

categoryRouter
  .route("/:id")
  .get(categoryController.getCategory)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

categoryRouter
  .route("/")
  .post(categoryController.createCategory)
  .get(categoryController.getCategorys)
  

export default categoryRouter;