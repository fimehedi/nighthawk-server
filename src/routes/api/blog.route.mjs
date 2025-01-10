import { Router } from "express";
import upload from "../../middlewares/uploads/upload.mjs";
import blogsController from "../../modules/blog/blog.controller.mjs";

const blogsRouter = Router();

blogsRouter
  .route("/")
  .post(upload.any(), blogsController.createBlog)
  .get(blogsController.getBlog);

  blogsRouter.get("/pages", blogsController.getBlogByPagination);

  blogsRouter
  .route("/:id")
  .get(blogsController.getBlogById)
  .put(upload.any(), blogsController.updateBlog)
  .delete(blogsController.deleteBlog);

export default blogsRouter;