import { Router } from 'express';
import adminRouter from './admin.route.mjs';
import assetRouter from './asset.route.mjs';
import categoryRouter from './category.route.mjs';
import generalRouter from './general.route.mjs';
import pageRouter from './page.route.mjs';
import sliderRouter from './slider.route.mjs';
import socialRouter from './social.route.mjs';
import subcategoryRouter from './sub.category.route.mjs';

const indexRouter = Router();

indexRouter.get('/', (req, res, next) => {
	res.status(200).json({
		status: 'success',
		code: 200,
		message: 'Welcome to the API',
	});
});

indexRouter.use('/admins', adminRouter);
indexRouter.use('/sliders', sliderRouter);
indexRouter.use('/categories', categoryRouter);
indexRouter.use('/sub-categories', subcategoryRouter);
indexRouter.use('/assets', assetRouter);
indexRouter.use('/pages', pageRouter);
indexRouter.use('/general', generalRouter);
indexRouter.use('/social', socialRouter);

export default indexRouter;
