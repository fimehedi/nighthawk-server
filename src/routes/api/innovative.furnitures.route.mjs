import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import innovativeFurnituresController from "../../modules/innovativeFurnitures/innovative.furnitures.controller.mjs";

const innovativeFurnituresRouter = Router();

innovativeFurnituresRouter
  .route("/")
  .post(upload.any(), innovativeFurnituresController.createInnovative)
  .get(innovativeFurnituresController.getInnovative);

  innovativeFurnituresRouter.get("/pages", innovativeFurnituresController.getInnovativesByPagination);

innovativeFurnituresRouter
  .route("/:id")
  .get(innovativeFurnituresController.getInnovativeById)
  .put(upload.any(), innovativeFurnituresController.updateInnovative)
  .delete(innovativeFurnituresController.deleteInnovative);

export default innovativeFurnituresRouter;