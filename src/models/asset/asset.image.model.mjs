import { Schema, model } from 'mongoose';

const assetImageSchema = new Schema({
	asset: {
		type: Schema.Types.ObjectId,
		ref: 'Asset',
	},
	image: {
		type: String,
	},
});

export const AssetImage = model('AssetImage', assetImageSchema);
