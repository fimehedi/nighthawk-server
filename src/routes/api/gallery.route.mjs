import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";

import galleryController from "../../modules/gallery/gallery.controller.mjs";

const galleyRouter = Router();

galleyRouter.get("/pages", galleryController.getGalleryByPagination);

galleyRouter
  .route("/:id")
  .get(galleryController.getGallery)
  .put(upload.any(), galleryController.updateGallery)
  .delete(galleryController.deleteGallery);

  galleyRouter
  .route("/")
  .post(upload.any(), galleryController.createGallery)
  .get(galleryController.getGalleries);

export default galleyRouter;