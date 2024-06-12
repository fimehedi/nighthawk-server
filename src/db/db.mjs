import mongoose from 'mongoose';
import { config } from '../config/config.mjs';

export const connectDB = async () => {
	if (!config.db_uri)
		return console.warn(
			'Database URI is not found in the environment variables.'
		);

	try {
		mongoose.connect(config.db_uri);
	} catch (error) {
		console.error(error);
	} finally {
		mongoose.connection.on('connected', () =>
			console.log('Connected to the database.')
		);
		mongoose.connection.on('disconnected', () =>
			console.log('Disconnected from the database.')
		);
		mongoose.connection.on('error', (error) => console.error(error));
	}
};
