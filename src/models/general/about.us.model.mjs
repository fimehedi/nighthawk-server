import { Schema, model } from 'mongoose';

const aboutUsSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		required: true,
		unique: true,
		default: 'about-us',
	},
	cover: {
		type: String,
	},
	short_description: {
		type: String,
	},
	content: {
		type: String,
	},
});

export const AboutUs = model('AboutUs', aboutUsSchema);
