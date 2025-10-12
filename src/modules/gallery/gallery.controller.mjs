import catchError from '../../middlewares/errors/catchError.mjs';
import responseHandler from '../../utils/responseHandler.mjs';
import galleryService from './gallery.service.mjs';

class GalleryController {
	createGallery = catchError(async (req, res, next) => {
		const gallery = await galleryService.createGallery({
			...req.body,
			files: req.files,
		});
		const resDoc = responseHandler(201, 'Gallery created successfully', gallery);
		res.status(201).json(resDoc);
	});

	updateGallery = catchError(async (req, res, next) => {
		const gallery = await galleryService.updateGallery(req.params.id, {
			...req.body,
			files: req.files,
		});
		const resDoc = responseHandler(200, 'Gallery updated successfully', gallery);
		res.status(200).json(resDoc);
	});

	getGalleries = catchError(async (req, res, next) => {
		const galleries = await galleryService.getGalleries();
		const resDoc = responseHandler(200, 'Galleries retrieved successfully', galleries);
		res.status(200).json(resDoc);
	});

	getGalleryByPagination = catchError(async (req, res, next) => {
		const { page, limit, order } = req.query;
		const galleries = await galleryService.getGalleryByPagination({
			page: parseInt(page),
			limit: parseInt(limit),
			order,
		});
		const resDoc = responseHandler(200, 'Galleries retrieved successfully', galleries);
		res.status(200).json(resDoc);
	});

	getGallery = catchError(async (req, res, next) => {
		const gallery = await galleryService.getGallery(req.params.id);
		const resDoc = responseHandler(200, 'Gallery retrieved successfully', gallery);
		res.status(200).json(resDoc);
	});

	deleteGallery = catchError(async (req, res, next) => {
		await galleryService.deleteGallery(req.params.id);
		const resDoc = responseHandler(200, 'Gallery deleted successfully');
		res.status(200).json(resDoc);
	});
}

export default new GalleryController();
