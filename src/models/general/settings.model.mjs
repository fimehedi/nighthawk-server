import { Schema, model } from 'mongoose';

const settingSchema = new Schema({
	slug: {
		type: String,
		required: true,
		unique: true,
		default: 'settings',
	},
	site_name: {
		type: String,
		required: true,
	},
	site_description: {
		type: String,
	},
	site_logo: {
		type: String,
	},
	site_favicon: {
		type: String,
	},
	site_email: {
		type: String,
	},
	site_phone: {
		type: String,
	},
	site_address: {
		type: String,
	},
	site_footer: {
		type: String,
	},
});

export const Setting = model('Setting', settingSchema);
