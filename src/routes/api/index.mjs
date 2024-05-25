import { Router } from 'express';
import adminRouter from './admin.route.mjs';
import assetRouter from './asset.route.mjs';
import categoryRouter from './category.route.mjs';
import sliderRouter from './slider.route.mjs';

const indexRouter = Router();

indexRouter.get('/', (req, res, next) => {
  res.status(200).json({
    status: 'success',
    code: 200,
    message: 'Welcome to the API'
  });
});

indexRouter.use('/admins', adminRouter);
indexRouter.use('/sliders', sliderRouter);
indexRouter.use('/categories', categoryRouter);
indexRouter.use('/assets', assetRouter);

export default indexRouter;