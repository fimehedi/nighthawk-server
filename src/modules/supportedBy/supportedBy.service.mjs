import { prisma } from "../../db/prisma.mjs";
import isArrayElementExist from "../../utils/isArrayElementExist.mjs";

class SupportedByService {

    async createsupportedBy(payload) {
        const images = {};
        if (isArrayElementExist(payload.files)) {
            payload.files.forEach((file) => {
                images[file.fieldname] = file.filename;
            });
        }

        // Construct data object for Prisma
        const { title, short_description } = payload;

        const innovativeFurniture = await prisma.supportedBy.create({
            data: {
                title,
                short_description,
                imageOne: images.imageOne || '',
                imageTwo: images.imageTwo || '',
                imageThree: images.imageThree || '',
                imageFour: images.imageFour || '',
                imageFive: images.imageFive || ''

            },
        });

        return innovativeFurniture;
    }


    async updateSupportedBy(id, payload) {
        // Handle files
        const images = {};
        if (isArrayElementExist(payload.files)) {
            payload.files.forEach((file) => {
                images[file.fieldname] = file.filename; // Map file fieldnames to filenames
            });
        }

        // Construct data object for Prisma
        const { title, short_description, urlOne, urlTwo, urlThree, urlFour } = payload;

        const updatedInnovativeFurniture = await prisma.supportedBy.update({
            where: {
                id: parseInt(id), // Ensure the ID is an integer
            },
            data: {
                title,
                short_description,
                urlOne,
                urlTwo,
                urlThree,
                urlFour,
                ...(images.bgImg && { bgImg: images.bgImg }), // Only include bgImg if it exists
            },
        });

        return updatedInnovativeFurniture;
    }


    async getSupportedBy() {
        // const supportedBy = await supportedBy.find();
        const supportedBy = await prisma.supportedBy.findMany();
        return supportedBy;
    }

    async getSupportedByByPagination({ page = 1, limit = 10, order = 'desc' }) {

        const supportedByPromise = await prisma.supportedBy.findMany({
            take: limit || 10,
            skip: (page - 1) * limit,
            orderBy: [
                {
                    id: order
                }
            ]

        });

        // const countPromise = supportedBy.countDocuments();
        const countPromise = prisma.supportedBy.count();

        const [supportedBy, total] = await Promise.all([supportedByPromise, countPromise]);

        const totalPage = Math.ceil(total / limit);
        const currentPage = page;

        return {
            result: supportedBy,
            pagination: {
                total,
                totalPage,
                currentPage,
            }
        };

    }

    async getSupportedByById(id) {
        // const supportedBy = await supportedBy.findById(id);
        const supportedBy = await prisma.supportedBy.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        return supportedBy;
    }

    async deleteSupportedBy(id) {
        await prisma.supportedBy.delete({
            where: {
                id: parseInt(id)
            }
        });
    }

}

export default new SupportedByService();