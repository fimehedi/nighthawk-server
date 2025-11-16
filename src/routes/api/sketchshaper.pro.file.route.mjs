import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import chunkUpload from "../../middlewares/uploads/chunkUpload.mjs";
import sketchShaperProFileController from "../../modules/sketchshaper-pro-file/sketchshaper.pro.file.controller.mjs";
import downloadController from "../../modules/sketchshaper-pro-file/download.controller.mjs";

const sketchShaperProFileRouter = Router();

// Chunked upload endpoints (specific routes first)
sketchShaperProFileRouter.post("/initialize", sketchShaperProFileController.initializeUpload);
sketchShaperProFileRouter.post("/upload-chunk", chunkUpload.single('chunk'), sketchShaperProFileController.uploadChunk);
sketchShaperProFileRouter.post("/complete", sketchShaperProFileController.completeUpload);

// Get files with pagination (must come before /:id route)
sketchShaperProFileRouter.get("/pages", sketchShaperProFileController.getFilesByPagination);

// Download endpoints
sketchShaperProFileRouter.get("/download/:id", downloadController.downloadFile);
sketchShaperProFileRouter.get("/download-info/:id", downloadController.getDownloadInfo);
sketchShaperProFileRouter.get("/status/:uploadSessionId", sketchShaperProFileController.getUploadStatus);
sketchShaperProFileRouter.delete("/cancel/:uploadSessionId", sketchShaperProFileController.cancelUpload);

// Update preview image
sketchShaperProFileRouter.put("/:id/preview", upload.any(), sketchShaperProFileController.updatePreviewImage);

// CRUD operations (parameterized route last)
sketchShaperProFileRouter
  .route("/:id")
  .get(sketchShaperProFileController.getFile)
  .put(upload.any(), sketchShaperProFileController.updateFile)
  .delete(sketchShaperProFileController.deleteFile);

export default sketchShaperProFileRouter;
