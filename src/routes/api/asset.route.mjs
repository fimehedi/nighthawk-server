import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import assetController from "../../modules/asset/asset.controller.mjs";

const assetRouter = Router();

assetRouter.get("/pages", assetController.getAssetsByPagination);

assetRouter
  .route("/:id")
  .get(assetController.getAsset)
  .put(upload.any(), assetController.updateAsset)
  .delete(assetController.deleteAsset);

assetRouter
  .route("/")
  .post(upload.any(), assetController.createAsset)
  .get(assetController.getAssets);

export default assetRouter;