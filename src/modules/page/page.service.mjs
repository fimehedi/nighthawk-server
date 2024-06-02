import { Page } from '../../models/page/page.model.mjs';

class PageService {
	async createPage(payload) {
		const slug = payload.title.toLowerCase().split(' ').join('-');

		// create the page
		const page = new Page({
			...payload,
			slug,
		});

		await page.save();

		return page;
	}

	async updatePage(id, payload) {
		const page = await Page.findByIdAndUpdate(
			id,
			{
				$set: payload,
			},
			{ new: true }
		);
		return page;
	}

	async getPages() {
		const pages = await Page.find();
		return pages;
	}

	async getPagesByPagination({ page = 1, limit = 10, order = 'desc' }) {
		const pagesPromise = Page.find()
			.sort({ createdAt: order === 'asc' ? 1 : -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		const countPromise = Page.countDocuments();

		const [pages, total] = await Promise.all([pagesPromise, countPromise]);

		const totalPage = Math.ceil(total / limit);
		const currentPage = page;

		return {
			result: pages,
			pagination: {
				total,
				totalPage,
				currentPage,
			},
		};
	}

	async getPage(id) {
		const page = await Page.findById(id);
		return page;
	}

	async deletePage(id) {
		await Page.findByIdAndDelete(id);
	}
}

export default new PageService();
