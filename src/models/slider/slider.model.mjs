import { Schema, model } from 'mongoose';

const sliderSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	logo: {
		type: String,
	},
	image: {
		type: String,
	},
	short_description: {
		type: String,
	},
});

export const Slider = model('Slider', sliderSchema);
