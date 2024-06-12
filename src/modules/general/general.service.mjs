import { prisma } from '../../db/prisma.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';

class GeneralService {
	async upsertAboutUs(payload) {
		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}

		// const aboutUs = await AboutUs.findOneAndUpdate(
		// 	{
		// 		slug: 'about-us',
		// 	},
		// 	{
		// 		$set: { ...payload, ...images },
		// 	},
		// 	{ new: true, upsert: true }
		// );

		delete payload.files;
		delete payload.slug;

		const aboutUs = await prisma.aboutUs.upsert({
			where: {
				slug: 'about-us'
			},
			update: {
				...payload,
				...images
			},
			create: {
				...payload,
				...images,
				slug: 'about-us'
			}

		});

		return aboutUs;
	}

	async getAboutUs() {
		// find with slug name about-us
		// const aboutUs = await AboutUs.findOne({ slug: 'about-us' });
		const aboutUs = await prisma.aboutUs.findUnique({
			where: {
				slug: 'about-us'
			}
		});
		return aboutUs;
	}

	async upsertApplicationSettings(payload) {

		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}

		// const settings = await Setting.findOneAndUpdate(
		// 	{
		// 		slug: 'settings',
		// 	},
		// 	{
		// 		$set: { ...payload, ...images },
		// 	},
		// 	{ new: true, upsert: true }
		// );


		delete payload.files;
		delete payload.slug;

		const settings = await prisma.setting.upsert({
			where: {
				slug: 'settings'
			},
			update: {
				...payload,
				...images
			},
			create: {
				...payload,
				...images,
				slug: 'settings'
			}
		});

		return settings;
	}

	async getApplicationSettings() {
		// find with slug name settings
		// const settings = await Setting.findOne({ slug: 'settings' });
		const settings = await prisma.setting.findUnique({
			where: {
				slug: 'settings'
			}
		});
		return settings;
	}
}

export default new GeneralService();
