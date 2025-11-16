import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";

import galleryController from "../../modules/gallery/gallery.controller.mjs";

const galleryRouter = Router();

galleryRouter.get("/pages", galleryController.getGalleryByPagination);

galleryRouter
  .route("/:id")
  .get(galleryController.getGallery)
  .put(upload.any(), galleryController.updateGallery)
  .delete(galleryController.deleteGallery);

  galleryRouter
  .route("/")
  .post(upload.any(), galleryController.createGallery)
  .get(galleryController.getGalleries);

export default galleryRouter;