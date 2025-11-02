import catchError from '../../middlewares/errors/catchError.mjs';
import responseHandler from '../../utils/responseHandler.mjs';
import commonService from './common.service.mjs';

class CommonController {
	search = catchError(async (req, res, next) => {

		const searchTerm = req.query.search;

		// Validate search term
		if (!searchTerm || searchTerm.trim() === '') {
			const resDoc = responseHandler(400, 'Search term is required and cannot be empty');
			return res.status(400).json(resDoc);
		}

		const search = await commonService.search(searchTerm.trim());

		const resDoc = responseHandler(200, 'Search completed successfully', search);
		res.status(200).json(resDoc);
	});


}

export default new CommonController();
