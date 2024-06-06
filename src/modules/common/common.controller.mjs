import catchError from '../../middlewares/errors/catchError.mjs';
import responseHandler from '../../utils/responseHandler.mjs';
import commonService from './common.service.mjs';

class CommonController {
	search = catchError(async (req, res, next) => {

		const searchTerm = req.query.search;

		if (!searchTerm) {
			const resDoc = responseHandler(400, 'Search Term is required');
			return res.status(400).json(resDoc);
		}

		const search = await commonService.search(searchTerm);

		const resDoc = responseHandler(201, 'Common created successfully', search);
		res.status(201).json(resDoc);
	});


}

export default new CommonController();
