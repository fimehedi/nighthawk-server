import jwt from 'jsonwebtoken';
import { config } from '../../config/config.mjs';
import { prisma } from '../../db/prisma.mjs';

/**
 * Middleware to verify Patreon authentication
 */
export const verifyPatreonAuth = async (req, res, next) => {
	try {
		// Get token from header OR query parameter (for direct download links)
		const authHeader = req.headers.authorization;
		let token = null;

		// First, try to get token from Authorization header
		if (authHeader && authHeader.startsWith('Bearer ')) {
			token = authHeader.split(' ')[1];
		}
		// If not in header, check query parameter
		else if (req.query.token) {
			token = req.query.token;
		}

		// If no token found in either location
		if (!token) {
			return res.status(401).json({
				status: 'error',
				code: 401,
				message: 'No token provided. Please login with Patreon.',
			});
		}

		// Verify JWT
		const decoded = jwt.verify(token, config.jwt_secret);

		// Check if user exists and is active patron
		const user = await prisma.patreonUser.findUnique({
			where: { id: decoded.id },
		});

		if (!user) {
			return res.status(401).json({
				code: 401,
				message: 'User not found.',
			});
		}

		// In development mode, allow non-patrons for testing
		const isDev = config.mode === 'dev';
		if (!user.is_active_patron && !isDev) {
			return res.status(403).json({
				status: 'error',
				code: 403,
				message:
					'Your Patreon subscription is not active. Please renew your subscription.',
			});
		}

		// Attach user to request
		req.user = {
			id: user.id,
			patreonId: user.patreon_id,
			membershipTier: user.membership_tier,
			isActivePatron: user.is_active_patron,
		};

		next();
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				status: 'error',
				code: 401,
				message: 'Invalid token.',
			});
		}

		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				status: 'error',
				code: 401,
				message: 'Token expired. Please login again.',
			});
		}

		return res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Authentication failed.',
		});
	}
};

/**
 * Middleware to check specific membership tier
 * Usage: verifyMembershipTier(['premium', 'standard'])
 */
export const verifyMembershipTier = (allowedTiers) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				status: 'error',
				code: 401,
				message: 'Authentication required.',
			});
		}

		if (!allowedTiers.includes(req.user.membershipTier)) {
			return res.status(403).json({
				status: 'error',
				code: 403,
				message: `This feature requires ${allowedTiers.join(' or ')} membership tier.`,
			});
		}

		next();
	};
};
