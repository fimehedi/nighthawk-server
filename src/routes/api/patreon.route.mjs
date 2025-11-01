import { Router } from 'express';
import patreonController from '../../modules/patreon/patreon.controller.mjs';
import { verifyPatreonAuth } from '../../middlewares/auth/verifyPatreonAuth.mjs';
import { verifyAdminAuth } from '../../middlewares/auth/verifyAdminAuth.mjs';

const patreonRouter = Router();

// Public routes
patreonRouter.get('/auth', patreonController.getAuthUrl);
patreonRouter.get('/callback', patreonController.handleCallback);

// Protected routes (require Patreon authentication)
patreonRouter.get('/verify', verifyPatreonAuth, patreonController.verifyStatus);
patreonRouter.get('/me', verifyPatreonAuth, patreonController.getCurrentUser);
patreonRouter.get('/check-download/:assetId', verifyPatreonAuth, patreonController.checkDownloadEligibility);

// Admin routes (require admin authentication)
patreonRouter.get('/users', verifyAdminAuth, patreonController.getAllUsers);
patreonRouter.get('/users/:id', verifyAdminAuth, patreonController.getUser);
patreonRouter.post(
	'/users/:id/revoke',
	verifyAdminAuth,
	patreonController.revokeAccess
);

export default patreonRouter;
