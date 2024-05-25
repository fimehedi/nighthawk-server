import { Router } from "express";
import assetController from "../../modules/asset/asset.controller.mjs";

const assetRouter = Router();

assetRouter
  .route("/:id")
  .get(assetController.getAsset)
  .put(assetController.updateAsset)
  .delete(assetController.deleteAsset);

assetRouter
  .route("/")
  .post(assetController.createAsset)
  .get(assetController.getAssets);

export default assetRouter;