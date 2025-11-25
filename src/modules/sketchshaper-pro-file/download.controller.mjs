import fs from 'fs';
import path from 'path';
import { prisma } from '../../db/prisma.mjs';
import catchError from "../../middlewares/errors/catchError.mjs";

class DownloadController {
  /**
   * Download file with streaming support and resume capability
   * GET /api/sketchshaper-pro-files/download/:id
   */
  downloadFile = catchError(async (req, res, next) => {
    const { id } = req.params;

    // Get file record
    const file = await prisma.sketchShaperProFile.findUnique({
      where: { id: parseInt(id) }
    });

    if (!file) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'File not found'
      });
    }

    if (file.upload_status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'File upload is not completed yet'
      });
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'uploads', file.main_file);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'File not found on server'
      });
    }

    // Get file stats
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Extract the actual filename from the stored path
    // main_file format: "sketchshaper-pro/1234567890-originalfilename.ext"
    const mainFile = file.main_file;
    const actualFilename = mainFile.includes('/') 
      ? mainFile.split('/').pop() 
      : mainFile;

    // Parse range header for resume support
    const range = req.headers.range;

    if (range) {
      // Handle range request (resume download)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      // Create read stream with range
      const fileStream = fs.createReadStream(filePath, { start, end });

      // Set headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': this.getContentType(file.file_type),
        'Content-Disposition': `attachment; filename="${actualFilename}"`
      });
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type, Content-Range');

      // Pipe the file stream to response
      fileStream.pipe(res);
    } else {
      // Handle full file download
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': this.getContentType(file.file_type),
        'Content-Disposition': `attachment; filename="${actualFilename}"`,
        'Accept-Ranges': 'bytes'
      });
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');

      // Create read stream
      const fileStream = fs.createReadStream(filePath);
      
      // Pipe the file stream to response
      fileStream.pipe(res);
    }
  });

  /**
   * Get file info for download
   * GET /api/sketchshaper-pro-files/download-info/:id
   */
  getDownloadInfo = catchError(async (req, res, next) => {
    const { id } = req.params;

    const file = await prisma.sketchShaperProFile.findUnique({
      where: { id: parseInt(id) },
      include: {
        sketchshaper_pro_category: true
      }
    });

    if (!file) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'File not found'
      });
    }

    if (file.upload_status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'File upload is not completed yet'
      });
    }

    res.status(200).json({
      status: 'success',
      code: 200,
      message: 'File info retrieved successfully',
      data: {
        id: file.id,
        name: file.name,
        fileType: file.file_type,
        size: file.size,
        sizeBytes: file.size_bytes.toString(),
        previewImage: file.preview_image,
        category: file.sketchshaper_pro_category,
        downloadUrl: `/api/sketchshaper-pro-files/download/${file.id}`
      }
    });
  });

  /**
   * Get content type based on file extension
   */
  getContentType(fileType) {
    const contentTypes = {
      '.skp': 'application/octet-stream',
      '.zip': 'application/zip',
      '.png': 'image/png',
      '.jpeg': 'image/jpeg',
      '.jpg': 'image/jpeg'
    };

    return contentTypes[fileType] || 'application/octet-stream';
  }
}

export default new DownloadController();
