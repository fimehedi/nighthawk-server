import express from 'express';

// Internal Imports
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/config.mjs';
import globalErrorHandler from './middlewares/errors/globalErrorHandler.mjs';
import indexRouter from './routes/api/index.mjs';

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// CORS configuration - allow multiple origins
const allowedOrigins = config.mode === 'dev' 
	? '*' 
	: [
		config.frontend_url,
		'https://admin.sketchshaper.com',
		'https://sketchshaper.com',
		'http://localhost:5173', // For local development
		'http://localhost:3000'  // For local development
	].filter(Boolean); // Remove undefined values

app.use(cors({
	origin: (origin, callback) => {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		
		if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
}));
app.use(morgan('dev'));
// Routes
app.use('/api', indexRouter);
app.use('/api/uploads', express.static('uploads'));

// Error Handler
app.use(globalErrorHandler);

app.listen(config.port, async () => {
	console.log(
		`Server is running in ${config.mode} mode at http://${config.host}:${config.port}`
	);
	// await connectDB();
});
