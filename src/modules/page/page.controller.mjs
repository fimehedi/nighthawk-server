import catchError from "../../middlewares/errors/catchError.mjs";
import responseHandler from "../../utils/responseHandler.mjs";
import pageService from "./page.service.mjs";

class PageController {
  createPage = catchError(async (req, res, next) => {
    const { name, image, short_description } = req.body;
    const page = await pageService.createPage({
      name,
      image,
      short_description
    });
    const resDoc = responseHandler(201, "Page created successfully", page);
    res.status(201).json(resDoc);
  });

  updatePage = catchError(async (req, res, next) => {
    const page = await pageService.updatePage(req.params.id, req.body);
    const resDoc = responseHandler(200, "Page updated successfully", page);
    res.status(200).json(resDoc);
  });

  getPages = catchError(async (req, res, next) => {
    const pages = await pageService.getPages();
    const resDoc = responseHandler(200, "Pages retrieved successfully", pages);
    res.status(200).json(resDoc);
  });


  getPage = catchError(async (req, res, next) => {
    const page = await pageService.getPage(req.params.id);
    const resDoc = responseHandler(200, "Page retrieved successfully", page);
    res.status(200).json(resDoc);
  });

  deletePage = catchError(async (req, res, next) => {
    await pageService.deletePage(req.params.id);
    const resDoc = responseHandler(200, "Page deleted successfully");
    res.status(200).json(resDoc);
  });
}

export default new PageController();