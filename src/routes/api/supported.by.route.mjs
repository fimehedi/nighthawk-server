import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import sliderController from "../../modules/slider/slider.controller.mjs";

const supportedBy = Router();

supportedBy
  .route("/")
  .post(upload.any(), sliderController.createSlider)
  .get(sliderController.getSliders);

  supportedBy.get("/pages", sliderController.getSlidersByPagination);

  supportedBy
  .route("/:id")
  .get(sliderController.getSlider)
  .put(upload.any(), sliderController.updateSlider)
  .delete(sliderController.deleteSlider);

export default supportedByRouter;