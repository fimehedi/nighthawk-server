import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import sliderController from "../../modules/slider/slider.controller.mjs";

const sliderRouter = Router();

sliderRouter
  .route("/")
  .post(upload.any(), sliderController.createSlider)
  .get(sliderController.getSliders);

sliderRouter.get("/pages", sliderController.getSlidersByPagination);

sliderRouter
  .route("/:id")
  .get(sliderController.getSlider)
  .put(upload.any(), sliderController.updateSlider)
  .delete(sliderController.deleteSlider);

export default sliderRouter;