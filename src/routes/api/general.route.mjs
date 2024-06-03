import { Router } from 'express';
import upload from '../../middlewares/uploads/upload.mjs';
import generalController from '../../modules/general/general.controller.mjs';

const generalRouter = Router();

generalRouter
	.route('/about-us')
	.post(upload.any(), generalController.upsertAboutUs)
	.get(generalController.getAboutUs);

generalRouter
	.route('/application-settings')
	.post(upload.any(), generalController.upsertApplicationSettings)
	.get(generalController.getApplicationSettings);

export default generalRouter;
