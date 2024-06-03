import { Router } from 'express';
import upload from '../../middlewares/uploads/upload.mjs';
import pageController from '../../modules/page/page.controller.mjs';

const pageRouter = Router();

pageRouter.get('/pages', pageController.getPagesByPagination);

pageRouter
	.route('/:id')
	.get(pageController.getPage)
	.put(upload.any(), pageController.updatePage)
	.delete(pageController.deletePage);

pageRouter
	.route('/')
	.post(upload.any(), pageController.createPage)
	.get(pageController.getPages);

export default pageRouter;
