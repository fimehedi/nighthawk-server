import catchError from "../../middlewares/errors/catchError.mjs";
import responseHandler from "../../utils/responseHandler.mjs";
import blogService from "./blog.service.mjs";

class BlogsController {
    createBlog = catchError(async (req, res, next) => {

        const { title, name, short_description, back_link } = req.body;

        const files = req.files;

        const blog = await blogService.createBlog({
            title,
            name,
            short_description,
            back_link,
            files,
        });
        const resDoc = responseHandler(201, "blog  created successfully", blog);
        res.status(201).json(resDoc);
    });


    updateBlog = catchError(async (req, res, next) => {
        const { id } = req.params;
        const { title, name, short_description, back_link } = req.body;
        const files = req.files;

        const blog = await blogService.updateBlog(id, {
            title,
            name,
            short_description,
            back_link,
            files,
        });

        // Send response
        const resDoc = responseHandler(200, "blog updated successfully", blog);
        res.status(200).json(resDoc);
    });

    getBlog = catchError(async (req, res, next) => {
        const blog = await blogService.getBlog();
        const resDoc = responseHandler(200, "blog retrieved successfully", blog);
        res.status(200).json(resDoc);
    });

    getBlogByPagination = catchError(async (req, res, next) => {
        const { page, limit, order } = req.query;
        const blog = await blogService.getBlogByPagination({ page: parseInt(page), limit: parseInt(limit), order });
        const resDoc = responseHandler(200, "blog retrieved successfully", blog);
        res.status(200).json(resDoc);
    });

    getBlogById = catchError(async (req, res, next) => {
        const blog = await blogService.getBlogById(req.params.id);
        const resDoc = responseHandler(200, "blog retrieved successfully", blog);
        res.status(200).json(resDoc);
    });

    deleteBlog = catchError(async (req, res, next) => {
        await blogService.deleteBlog(req.params.id);
        const resDoc = responseHandler(200, "blog deleted successfully");
        res.status(200).json(resDoc);
    });
}

export default new BlogsController();