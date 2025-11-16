import catchError from "../../middlewares/errors/catchError.mjs";
import responseHandler from "../../utils/responseHandler.mjs";
import sketchShaperProFileService from "./sketchshaper.pro.file.service.mjs";

class SketchShaperProFileController {
  /**
   * Initialize upload session
   * POST /api/sketchshaper-pro-files/initialize
   */
  initializeUpload = catchError(async (req, res, next) => {
    const result = await sketchShaperProFileService.initializeUpload(req.body);
    const resDoc = responseHandler(201, result.message, {
      uploadSessionId: result.uploadSessionId,
      fileId: result.fileId
    });
    res.status(201).json(resDoc);
  });

  /**
   * Upload a chunk
   * POST /api/sketchshaper-pro-files/upload-chunk
   */
  uploadChunk = catchError(async (req, res, next) => {
    const { uploadSessionId, chunkIndex } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'No chunk file provided'
      });
    }

    const result = await sketchShaperProFileService.uploadChunk({
      uploadSessionId,
      chunkIndex,
      chunkData: req.file.buffer
    });

    const resDoc = responseHandler(200, result.message, result);
    res.status(200).json(resDoc);
  });

  /**
   * Complete upload (merge chunks)
   * POST /api/sketchshaper-pro-files/complete
   */
  completeUpload = catchError(async (req, res, next) => {
    const result = await sketchShaperProFileService.completeUpload(req.body);
    const resDoc = responseHandler(200, result.message, result.file);
    res.status(200).json(resDoc);
  });

  /**
   * Get upload status
   * GET /api/sketchshaper-pro-files/status/:uploadSessionId
   */
  getUploadStatus = catchError(async (req, res, next) => {
    const { uploadSessionId } = req.params;
    const result = await sketchShaperProFileService.getUploadStatus(uploadSessionId);
    const resDoc = responseHandler(200, "Upload status retrieved successfully", result);
    res.status(200).json(resDoc);
  });

  /**
   * Cancel upload
   * DELETE /api/sketchshaper-pro-files/cancel/:uploadSessionId
   */
  cancelUpload = catchError(async (req, res, next) => {
    const { uploadSessionId } = req.params;
    const result = await sketchShaperProFileService.cancelUpload(uploadSessionId);
    const resDoc = responseHandler(200, result.message);
    res.status(200).json(resDoc);
  });

  /**
   * Update preview image
   * PUT /api/sketchshaper-pro-files/:id/preview
   */
  updatePreviewImage = catchError(async (req, res, next) => {
    const file = await sketchShaperProFileService.updatePreviewImage(req.params.id, {
      ...req.body,
      files: req.files,
    });
    const resDoc = responseHandler(200, "Preview image updated successfully", file);
    res.status(200).json(resDoc);
  });

  /**
   * Get files with pagination
   * GET /api/sketchshaper-pro-files/pages
   */
  getFilesByPagination = catchError(async (req, res, next) => {
    const { page, limit, order, categoryId } = req.query;
    const files = await sketchShaperProFileService.getFilesByPagination({ 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 10, 
      order: order || 'desc',
      categoryId: categoryId || null
    });
    const resDoc = responseHandler(200, "Files retrieved successfully", files);
    res.status(200).json(resDoc);
  });

  /**
   * Get single file
   * GET /api/sketchshaper-pro-files/:id
   */
  getFile = catchError(async (req, res, next) => {
    const { id } = req.params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'File ID is required'
      });
    }
    
    const file = await sketchShaperProFileService.getFile(id);
    
    if (!file) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'File not found'
      });
    }
    
    const resDoc = responseHandler(200, "File retrieved successfully", file);
    res.status(200).json(resDoc);
  });

  /**
   * Update file details
   * PUT /api/sketchshaper-pro-files/:id
   */
  updateFile = catchError(async (req, res, next) => {
    const file = await sketchShaperProFileService.updateFile(req.params.id, {
      ...req.body,
      files: req.files,
    });
    const resDoc = responseHandler(200, "File updated successfully", file);
    res.status(200).json(resDoc);
  });

  /**
   * Delete file
   * DELETE /api/sketchshaper-pro-files/:id
   */
  deleteFile = catchError(async (req, res, next) => {
    await sketchShaperProFileService.deleteFile(req.params.id);
    const resDoc = responseHandler(200, "File deleted successfully");
    res.status(200).json(resDoc);
  });
}

export default new SketchShaperProFileController();
