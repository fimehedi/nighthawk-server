import { Router } from 'express';
import pageController from '../../modules/page/page.controller.mjs';

const pageRouter = Router();

pageRouter.get('/pages', pageController.getPagesByPagination);

pageRouter
	.route('/:id')
	.get(pageController.getPage)
	.put(pageController.updatePage)
	.delete(pageController.deletePage);

pageRouter
	.route('/')
	.post(pageController.createPage)
	.get(pageController.getPages);

export default pageRouter;
