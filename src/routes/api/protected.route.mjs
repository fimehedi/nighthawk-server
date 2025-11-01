import { Router } from 'express';
import {
	verifyPatreonAuth,
	verifyMembershipTier,
} from '../../middlewares/auth/verifyPatreonAuth.mjs';

const protectedRouter = Router();

/**
 * Example: Protected route - requires any active Patreon subscription
 */
protectedRouter.get('/premium-content', verifyPatreonAuth, (req, res) => {
	res.status(200).json({
		status: 'success',
		code: 200,
		message: 'Welcome to premium content!',
		data: {
			user: req.user,
			content: 'This is exclusive content for Patreon supporters.',
		},
	});
});

/**
 * Example: Tier-specific route - requires premium tier
 */
protectedRouter.get(
	'/premium-only',
	verifyPatreonAuth,
	verifyMembershipTier(['premium']),
	(req, res) => {
		res.status(200).json({
			status: 'success',
			code: 200,
			message: 'Welcome to premium-only content!',
			data: {
				user: req.user,
				content: 'This is exclusive content for premium tier patrons only.',
			},
		});
	}
);

/**
 * Example: Standard or Premium tier route
 */
protectedRouter.get(
	'/standard-plus',
	verifyPatreonAuth,
	verifyMembershipTier(['standard', 'premium']),
	(req, res) => {
		res.status(200).json({
			status: 'success',
			code: 200,
			message: 'Welcome to standard+ content!',
			data: {
				user: req.user,
				content: 'This is content for standard and premium tier patrons.',
			},
		});
	}
);

export default protectedRouter;
