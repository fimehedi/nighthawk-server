import { Router } from 'express';
import extensionDownloadController from '../../modules/extension-download/extension-download.controller.mjs';

const extensionDownloadRouter = Router();

// Increment download count (called when user clicks download button)
extensionDownloadRouter.post('/increment', extensionDownloadController.incrementDownloadCount);

// Get download count for a specific extension
extensionDownloadRouter.get('/:extensionName', extensionDownloadController.getDownloadCount);

// Get all extensions with their download counts
extensionDownloadRouter.get('/', extensionDownloadController.getAllDownloadCounts);

// Get download counts with pagination
extensionDownloadRouter.get('/paginated/list', extensionDownloadController.getDownloadCountByPagination);

// Reset download count for an extension (admin only)
extensionDownloadRouter.put('/reset/:extensionName', extensionDownloadController.resetDownloadCount);

// Delete an extension record (admin only)
extensionDownloadRouter.delete('/:extensionName', extensionDownloadController.deleteExtension);

export default extensionDownloadRouter;
