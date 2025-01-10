import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import supportedByController from "../../modules/supportedBy/supportedBy.controller.mjs";

const supportedByRouter = Router();

supportedByRouter
  .route("/")
  .post(upload.any(), supportedByController.createSupportedBy)
  .get(supportedByController.getSupportedBy);

  supportedByRouter.get("/pages", supportedByController.getSupportedByByPagination);

  supportedByRouter
  .route("/:id")
  .get(supportedByController.getSupportedByById)
  .put(upload.any(), supportedByController.updateSupportedBy)
  .delete(supportedByController.deleteSupportedBy);

export default supportedByRouter;