import { prisma } from '../../db/prisma.mjs';
import isArrayElementExist from '../../utils/isArrayElementExist.mjs';

class PageService {
	async createPage(payload) {
		const slug = payload.title.toLowerCase().split(' ').join('-');
		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}

		delete payload.files;

		const page = await prisma.page.create({
			data: {
				...payload,
				slug,
				...images,
			},

		});

		return page;
	}

	async updatePage(id, payload) {
		const images = {};
		if (isArrayElementExist(payload.files)) {
			payload.files.forEach((file) => {
				images[file.fieldname] = file.filename;
			});
		}

		delete payload.files;
		const page = await prisma.page.update({
			where: {
				id: parseInt(id),
			},
			data: {
				...payload,
				...images,
			},
		});
		return page;
	}

	async getPages() {
		// const pages = await Page.find();
		const pages = await prisma.page.findMany();
		return pages;
	}

	async getPagesByPagination({ page = 1, limit = 10, order = 'desc' }) {
		// const pagesPromise = Page.find()
		// 	.sort({ createdAt: order === 'asc' ? 1 : -1 })
		// 	.skip((page - 1) * limit)
		// 	.limit(limit);
		const pagesPromise = prisma.page.findMany({
			skip: (page - 1) * limit,
			take: limit,
			orderBy: {
				id: order === 'asc' ? 'asc' : 'desc',
			},
		});

		// const countPromise = Page.countDocuments();
		const countPromise = prisma.page.count();

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
		// const page = await Page.findById(id);
		const page = await prisma.page.findUnique({
			where: {
				id: parseInt(id),
			},
		});
		return page;
	}

	async deletePage(id) {
		await prisma.page.delete({
			where: {
				id: parseInt(id),
			},
		});
	}
}

export default new PageService();
