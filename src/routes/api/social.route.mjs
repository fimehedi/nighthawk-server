import { Router } from 'express';
import upload from '../../middlewares/uploads/upload.mjs';
import socialController from '../../modules/social/social.controller.mjs';

const socialRouter = Router();

socialRouter.get('/pages', socialController.getSocialsByPagination);

socialRouter
	.route('/:id')
	.get(socialController.getSocial)
	.put(upload.any(), socialController.updateSocial)
	.delete(socialController.deleteSocial);

socialRouter
	.route('/')
	.post(upload.any(), socialController.createSocial)
	.get(socialController.getSocials);

export default socialRouter;
