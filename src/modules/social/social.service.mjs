import { Social } from '../../models/social/social.model.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';

class SocialService {
	async createSocial(payload) {
		const slug = payload.title.toLowerCase().split(' ').join('-');
		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}
		// create the social
		const social = new Social({
			...payload,
			...images,
			slug,
		});

		await social.save();

		return social;
	}

	async updateSocial(id, payload) {
		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}

		const social = await Social.findByIdAndUpdate(
			id,
			{
				$set: { ...payload, ...images },
			},
			{ new: true }
		);
		return social;
	}

	async getSocials() {
		const socials = await Social.find();
		return socials;
	}

	async getSocialsByPagination({ social = 1, limit = 10, order = 'desc' }) {
		const socialsPromise = Social.find()
			.sort({ createdAt: order === 'asc' ? 1 : -1 })
			.skip((social - 1) * limit)
			.limit(limit);

		const countPromise = Social.countDocuments();

		const [socials, total] = await Promise.all([socialsPromise, countPromise]);

		const totalSocial = Math.ceil(total / limit);
		const currentSocial = social;

		return {
			result: socials,
			pagination: {
				total,
				totalSocial,
				currentSocial,
			},
		};
	}

	async getSocial(id) {
		const social = await Social.findById(id);
		return social;
	}

	async deleteSocial(id) {
		await Social.findByIdAndDelete(id);
	}
}

export default new SocialService();
