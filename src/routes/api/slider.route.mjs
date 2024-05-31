import { Router } from "express";
import sliderController from "../../modules/slider/slider.controller.mjs";

const sliderRouter = Router();

sliderRouter
  .route("/")
  .post(sliderController.createSlider)
  .get(sliderController.getSliders);

sliderRouter.get("/pages", sliderController.getSlidersByPagination);

sliderRouter
  .route("/:id")
  .get(sliderController.getSlider)
  .put(sliderController.updateSlider)
  .delete(sliderController.deleteSlider);

export default sliderRouter;