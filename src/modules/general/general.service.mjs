import { AboutUs } from '../../models/general/about.us.model.mjs';

class GeneralService {
	async upsertAboutUs(payload) {
		const aboutUs = await AboutUs.findOneAndUpdate(
			{
				slug: 'about-us',
			},
			{
				$set: payload,
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
		const settings = await AboutUs.findOneAndUpdate(
			{
				slug: 'settings',
			},
			{
				$set: payload,
			},
			{ new: true, upsert: true }
		);
		return settings;
	}

	async getApplicationSettings() {
		// find with slug name settings
		const settings = await AboutUs.findOne({ slug: 'settings' });
		return settings;
	}
}

export default new GeneralService();
