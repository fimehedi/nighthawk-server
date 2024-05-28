import 'dotenv/config';

const {
	MODE,
	DEV_PORT,
	PROD_PORT,
	DEV_HOST,
	PROD_HOST,
	DEV_DB_URI,
	PROD_DB_URI,
	JWT_SECRET,
} = process.env;

export const config = {
	mode: MODE,
	port: MODE === 'dev' ? DEV_PORT : PROD_PORT,
	host: MODE === 'dev' ? DEV_HOST : PROD_HOST,
	db_uri: MODE === 'dev' ? DEV_DB_URI : PROD_DB_URI,
	jwt_secret: JWT_SECRET,
};
