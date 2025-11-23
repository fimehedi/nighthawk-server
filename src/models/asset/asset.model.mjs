import { Schema, model } from 'mongoose';

const assetSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	size: {
		type: String,
	},
	resolution: {
		type: String,
	},
	cover: {
		type: String,
	},
	images: {
		type: Array,
	},
	sub_category: {
		type: Schema.Types.ObjectId,
		ref: 'SubCategory',
	},
	// File upload fields
	main_file: {
		type: String,
		default: '',
	},
	file_type: {
		type: String,
		default: '',
	},
	size_bytes: {
		type: BigInt,
		default: 0n,
	},
	upload_status: {
		type: String,
		enum: ['pending', 'uploading', 'completed', 'failed'],
		default: 'pending',
	},
	upload_progress: {
		type: Number,
		default: 0,
	},
	uploaded_chunks: {
		type: Number,
		default: 0,
	},
	total_chunks: {
		type: Number,
		default: 0,
	},
	upload_session_id: {
		type: String,
		unique: true,
		sparse: true,
	},
});

export const Asset = model('Asset', assetSchema);
