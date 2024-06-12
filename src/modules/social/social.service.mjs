import { prisma } from '../../db/prisma.mjs';
import { Social } from '../../models/social/social.model.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';

class SocialService {
	async createSocial(payload) {
		const slug = payload.name.toLowerCase().split(' ').join('-');
		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}
		// create the social
		// const social = await prisma.social.create({
		// 	data: {
		// 		...payload,
		// 		...images,
		// 		slug,
		// 	}
		// });

		delete payload.files;

		const social = await Social.create({
			...payload,
			...images,
			slug,
		});

		return social;
	}

	async updateSocial(id, payload) {
		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}

		delete payload.files;

		const social = await prisma.social.update({
			where: {
				id: parseInt(id),
			},
			data: {
				...payload,
				...images,
			},
		});

		return social;
	}

	async getSocials() {
		// const socials = await Social.find();
		const socials = await prisma.social.findMany();
		return socials;
	}

	async getSocialsByPagination({ social = 1, limit = 10, order = 'desc' }) {
		// const socialsPromise = Social.find()
		// 	.sort({ createdAt: order === 'asc' ? 1 : -1 })
		// 	.skip((social - 1) * limit)
		// 	.limit(limit);

		const socialsPromise = prisma.social.findMany({
			skip: (social - 1) * limit,
			take: limit,
			orderBy: {
				id: order === 'asc' ? 'asc' : 'desc',
			},
		});

		// const countPromise = Social.countDocuments();
		const countPromise = prisma.social.count();

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
		// const social = await Social.findById(id);
		const social = await prisma.social.findUnique({
			where: {
				id: parseInt(id),
			},
		});
		return social;
	}

	async deleteSocial(id) {
		await prisma.social.delete({
			where: {
				id: parseInt(id),
			},
		});
	}
}

export default new SocialService();
