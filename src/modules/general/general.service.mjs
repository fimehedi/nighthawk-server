import { AboutUs } from '../../models/general/about.us.model.mjs';
import { Setting } from '../../models/general/settings.model.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';

class GeneralService {
	async upsertAboutUs(payload) {
		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}

		const aboutUs = await AboutUs.findOneAndUpdate(
			{
				slug: 'about-us',
			},
			{
				$set: { ...payload, ...images },
			},
			{ new: true, upsert: true }
		);
		return aboutUs;
	}

	async getAboutUs() {
		// find with slug name about-us
		const aboutUs = await AboutUs.findOne({ slug: 'about-us' });
		return aboutUs;
	}

	async upsertApplicationSettings(payload) {

		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}

		const settings = await Setting.findOneAndUpdate(
			{
				slug: 'settings',
			},
			{
				$set: { ...payload, ...images },
			},
			{ new: true, upsert: true }
		);
		return settings;
	}

	async getApplicationSettings() {
		// find with slug name settings
		const settings = await Setting.findOne({ slug: 'settings' });
		return settings;
	}
}

export default new GeneralService();
