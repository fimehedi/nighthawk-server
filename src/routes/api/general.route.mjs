import { Router } from 'express';
import generalController from '../../modules/general/general.controller.mjs';

const generalRouter = Router();

generalRouter
	.route('/about-us')
	.post(generalController.upsertAboutUs)
	.get(generalController.getAboutUs);

generalRouter
	.route('/application-settings')
	.post(generalController.upsertApplicationSettings)
	.get(generalController.getApplicationSettings);

export default generalRouter;
