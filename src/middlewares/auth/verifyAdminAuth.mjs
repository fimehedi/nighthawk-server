import jwt from 'jsonwebtoken';
import { config } from '../../config/config.mjs';
import { prisma } from '../../db/prisma.mjs';

/**
 * Middleware to verify Admin authentication
 */
export const verifyAdminAuth = async (req, res, next) => {
	try {
		// Get token from header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				status: 'error',
				code: 401,
				message: 'No token provided. Admin authentication required.',
			});
		}

		const token = authHeader.split(' ')[1];

		// Verify JWT
		const decoded = jwt.verify(token, config.jwt_secret);

		// Check if admin exists
		const admin = await prisma.user.findUnique({
			where: { id: decoded.id },
		});

		if (!admin) {
			return res.status(401).json({
				status: 'error',
				code: 401,
				message: 'Admin not found.',
			});
		}

		// Attach admin to request
		req.admin = {
			id: admin.id,
			email: admin.email,
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
