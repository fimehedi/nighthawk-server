import catchError from '../../middlewares/errors/catchError.mjs';
import responseHandler from '../../utils/responseHandler.mjs';
import patreonService from './patreon.service.mjs';

class PatreonController {
	/**
	 * Get Patreon OAuth authorization URL
	 */
	getAuthUrl = catchError(async (req, res, next) => {
		const { intent } = req.query;
		const authUrl = patreonService.getAuthUrl(intent);
		const resDoc = responseHandler(200, 'Authorization URL generated', {
			authUrl,
		});
		res.status(200).json(resDoc);
	});

	/**
	 * Handle OAuth callback from Patreon
	 */
	handleCallback = catchError(async (req, res, next) => {
		const { code, state } = req.query;

		if (!code) {
			throw new Error('Authorization code is required');
		}

		const result = await patreonService.handleOAuthCallback(code);
		
		// If frontend URL is configured, redirect with token
		const frontendUrl = process.env.FRONTEND_URL;
		if (frontendUrl) {
			const redirectUrl = `${frontendUrl}/auth/patreon/callback?token=${result.token}&success=true`;
			return res.redirect(redirectUrl);
		}

		// Otherwise return JSON response
		const resDoc = responseHandler(
			200,
			'Successfully authenticated with Patreon',
			result
		);
		res.status(200).json(resDoc);
	});

	/**
	 * Verify current user's patron status
	 */
	verifyStatus = catchError(async (req, res, next) => {
		const userId = req.user.id; // From auth middleware

		const isActive = await patreonService.verifyUserPatronStatus(userId);
		const resDoc = responseHandler(200, 'Patron status verified', {
			isActivePatron: isActive,
		});
		res.status(200).json(resDoc);
	});

	/**
	 * Get all Patreon users (Admin only)
	 */
	getAllUsers = catchError(async (req, res, next) => {
		const users = await patreonService.getAllPatreonUsers();
		const resDoc = responseHandler(
			200,
			'Patreon users retrieved successfully',
			users
		);
		res.status(200).json(resDoc);
	});

	/**
	 * Get single Patreon user (Admin only)
	 */
	getUser = catchError(async (req, res, next) => {
		const user = await patreonService.getPatreonUser(req.params.id);
		const resDoc = responseHandler(
			200,
			'Patreon user retrieved successfully',
			user
		);
		res.status(200).json(resDoc);
	});

	/**
	 * Revoke user access (Admin only)
	 */
	revokeAccess = catchError(async (req, res, next) => {
		await patreonService.revokeUserAccess(req.params.id);
		const resDoc = responseHandler(200, 'User access revoked successfully');
		res.status(200).json(resDoc);
	});

	/**
	 * Get current authenticated user info
	 */
	getCurrentUser = catchError(async (req, res, next) => {
		const user = await patreonService.getPatreonUser(req.user.id);
		const resDoc = responseHandler(200, 'User data retrieved successfully', user);
		res.status(200).json(resDoc);
	});

	/**
	 * Check if user is eligible to download an asset
	 */
	checkDownloadEligibility = catchError(async (req, res, next) => {
		const { assetId } = req.params;
		const userId = req.user.id;

		// Verify patron status is still active
		const isActive = await patreonService.verifyUserPatronStatus(userId);

		if (!isActive) {
			return res.status(403).json({
				status: 'error',
				code: 403,
				message: 'Your Patreon subscription is not active. Please renew to download.',
			});
		}

		const resDoc = responseHandler(200, 'Download authorized', {
			canDownload: true,
			assetId,
			membershipTier: req.user.membershipTier,
		});
		res.status(200).json(resDoc);
	});
}

export default new PatreonController();
