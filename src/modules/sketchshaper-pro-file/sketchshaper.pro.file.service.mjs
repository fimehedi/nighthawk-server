import { prisma } from '../../db/prisma.mjs';
import chunkUploadHelper from '../../utils/chunkUploadHelper.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';

class SketchShaperProFileService {
  /**
   * Initialize a new upload session
   */
  async initializeUpload(payload) {
    const { name, sketchshaper_pro_category_id, totalChunks, totalSize, originalFilename } = payload;

    // Validate file type
    if (!chunkUploadHelper.isValidFileType(originalFilename)) {
      throw new Error('Invalid file type. Allowed types: .skp, .zip, .png, .jpeg, .jpg');
    }

    // Generate upload session ID
    const uploadSessionId = chunkUploadHelper.generateSessionId();
    const fileType = chunkUploadHelper.getFileExtension(originalFilename);
    const sizeFormatted = chunkUploadHelper.formatBytes(parseInt(totalSize));

    // Create file record with pending status
    const file = await prisma.sketchShaperProFile.create({
      data: {
        name,
        preview_image: '', // Will be updated later
        main_file: '', // Will be set after all chunks are uploaded
        file_type: fileType,
        size: sizeFormatted,
        size_bytes: BigInt(totalSize),
        upload_status: 'pending',
        upload_progress: 0,
        uploaded_chunks: 0,
        total_chunks: parseInt(totalChunks),
        upload_session_id: uploadSessionId,
        sketchshaper_pro_category_id: parseInt(sketchshaper_pro_category_id),
      },
    });

    return {
      fileId: file.id,
      uploadSessionId,
      message: 'Upload session initialized'
    };
  }

  /**
   * Upload a single chunk
   */
  async uploadChunk(payload) {
    const { uploadSessionId, chunkIndex, chunkData } = payload;

    // Find the file record
    const file = await prisma.sketchShaperProFile.findUnique({
      where: { upload_session_id: uploadSessionId }
    });

    if (!file) {
      throw new Error('Upload session not found');
    }

    // Check if chunk already exists (for resume functionality)
    const chunkExists = await chunkUploadHelper.chunkExists(uploadSessionId, parseInt(chunkIndex));
    if (chunkExists) {
      return {
        message: 'Chunk already uploaded',
        chunkIndex: parseInt(chunkIndex),
        progress: file.upload_progress
      };
    }

    // Save the chunk
    await chunkUploadHelper.saveChunk(uploadSessionId, parseInt(chunkIndex), chunkData);

    // Update file record
    const uploadedChunks = file.uploaded_chunks + 1;
    const progress = (uploadedChunks / file.total_chunks) * 100;

    const updatedFile = await prisma.sketchShaperProFile.update({
      where: { id: file.id },
      data: {
        uploaded_chunks: uploadedChunks,
        upload_progress: progress,
        upload_status: uploadedChunks === file.total_chunks ? 'completed' : 'uploading'
      }
    });

    return {
      message: 'Chunk uploaded successfully',
      chunkIndex: parseInt(chunkIndex),
      uploadedChunks,
      totalChunks: file.total_chunks,
      progress: progress.toFixed(2),
      status: updatedFile.upload_status
    };
  }

  /**
   * Complete the upload by merging all chunks
   */
  async completeUpload(payload) {
    const { uploadSessionId, originalFilename } = payload;

    // Find the file record
    const file = await prisma.sketchShaperProFile.findUnique({
      where: { upload_session_id: uploadSessionId }
    });

    if (!file) {
      throw new Error('Upload session not found');
    }

    // Check if all chunks are uploaded
    if (file.uploaded_chunks !== file.total_chunks) {
      throw new Error(`Missing chunks. Uploaded: ${file.uploaded_chunks}/${file.total_chunks}`);
    }

    // Merge chunks into final file
    const mergedFile = await chunkUploadHelper.mergeChunks(
      uploadSessionId,
      file.total_chunks,
      originalFilename
    );

    // Update file record with final file path
    const updatedFile = await prisma.sketchShaperProFile.update({
      where: { id: file.id },
      data: {
        main_file: mergedFile.relativePath,
        upload_status: 'completed',
        upload_progress: 100
      },
      include: {
        sketchshaper_pro_category: true
      }
    });

    // Convert BigInt to string for JSON serialization
    const fileData = {
      ...updatedFile,
      size_bytes: updatedFile.size_bytes.toString()
    };

    return {
      message: 'File upload completed successfully',
      file: fileData
    };
  }

  /**
   * Update file preview image
   */
  async updatePreviewImage(id, payload) {
    const images = {};
    if (isArrayElementExist(payload.files)) {
      payload.files.forEach((file) => {
        images[file.fieldname] = file.filename;
      });
    }

    const file = await prisma.sketchShaperProFile.update({
      where: { id: parseInt(id) },
      data: {
        preview_image: images.preview_image || payload.preview_image
      }
    });

    return file;
  }

  /**
   * Get upload status
   */
  async getUploadStatus(uploadSessionId) {
    const file = await prisma.sketchShaperProFile.findUnique({
      where: { upload_session_id: uploadSessionId },
      include: {
        sketchshaper_pro_category: true
      }
    });

    if (!file) {
      throw new Error('Upload session not found');
    }

    // Get list of uploaded chunks
    const uploadedChunksList = await chunkUploadHelper.getUploadedChunks(uploadSessionId);

    return {
      fileId: file.id,
      name: file.name,
      uploadStatus: file.upload_status,
      uploadProgress: file.upload_progress,
      uploadedChunks: file.uploaded_chunks,
      totalChunks: file.total_chunks,
      uploadedChunksList,
      category: file.sketchshaper_pro_category,
      size_bytes: file.size_bytes.toString()
    };
  }

  /**
   * Get all files with pagination
   */
  async getFilesByPagination({ page = 1, limit = 10, order = 'desc', categoryId = null }) {
    const where = categoryId ? {
      sketchshaper_pro_category_id: parseInt(categoryId),
      upload_status: 'completed'
    } : {
      upload_status: 'completed'
    };

    const filesPromise = prisma.sketchShaperProFile.findMany({
      where,
      take: limit || 10,
      skip: (page - 1) * limit,
      orderBy: [
        {
          id: order,
        },
      ],
      include: {
        sketchshaper_pro_category: true,
      },
    });

    const countPromise = prisma.sketchShaperProFile.count({ where });

    const [files, total] = await Promise.all([
      filesPromise,
      countPromise,
    ]);

    // Convert BigInt to string for JSON serialization
    const filesData = files.map(file => ({
      ...file,
      size_bytes: file.size_bytes.toString()
    }));

    const totalPage = Math.ceil(total / limit);
    const currentPage = page;

    return {
      result: filesData,
      pagination: {
        total,
        totalPage,
        currentPage,
      },
    };
  }

  /**
   * Get single file
   */
  async getFile(id) {
    const file = await prisma.sketchShaperProFile.findUnique({
      where: { id: parseInt(id) },
      include: {
        sketchshaper_pro_category: true
      }
    });

    if (!file) return null;

    // Convert BigInt to string for JSON serialization
    return {
      ...file,
      size_bytes: file.size_bytes.toString()
    };
  }

  /**
   * Update file details
   */
  async updateFile(id, payload) {
    const images = {};
    if (isArrayElementExist(payload.files)) {
      payload.files.forEach((file) => {
        images[file.fieldname] = file.filename;
      });
    }

    delete payload.files;

    const file = await prisma.sketchShaperProFile.update({
      where: { id: parseInt(id) },
      data: {
        ...payload,
        ...images,
      },
      include: {
        sketchshaper_pro_category: true
      }
    });

    // Convert BigInt to string for JSON serialization
    return {
      ...file,
      size_bytes: file.size_bytes.toString()
    };
  }

  /**
   * Delete file
   */
  async deleteFile(id) {
    const file = await prisma.sketchShaperProFile.findUnique({
      where: { id: parseInt(id) }
    });

    if (file && file.upload_session_id) {
      // Clean up any remaining chunks
      await chunkUploadHelper.cleanupSession(file.upload_session_id);
    }

    await prisma.sketchShaperProFile.delete({
      where: { id: parseInt(id) }
    });
  }

  /**
   * Cancel upload
   */
  async cancelUpload(uploadSessionId) {
    const file = await prisma.sketchShaperProFile.findUnique({
      where: { upload_session_id: uploadSessionId }
    });

    if (!file) {
      throw new Error('Upload session not found');
    }

    // Clean up chunks
    await chunkUploadHelper.cleanupSession(uploadSessionId);

    // Delete file record
    await prisma.sketchShaperProFile.delete({
      where: { id: file.id }
    });

    return { message: 'Upload cancelled successfully' };
  }
}

export default new SketchShaperProFileService();
