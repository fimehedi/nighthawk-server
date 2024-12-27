import catchError from "../../middlewares/errors/catchError.mjs";
import responseHandler from "../../utils/responseHandler.mjs";
import innovativeFurnituresService from "./innovative.furnitures.service.mjs";

class InnovativeFurnituresController {
  createInnovative = catchError(async (req, res, next) => {
    const innovativeFurnitures = await innovativeFurnituresService.createInnovative({
        ...req.body,
        files: req.files,
    });
    const resDoc = responseHandler(201, " Innovative Furnitures created successfully", innovativeFurnitures);
    res.status(201).json(resDoc);
  });

  updateInnovative  = catchError(async (req, res, next) => {
    const innovativeFurnitures = await innovativeFurnituresService.updateInnovative(req.params.id, {
      ...req.body,
      files: req.files,
    });
    const resDoc = responseHandler(200, "Innovative updated successfully", innovativeFurnitures);
    res.status(200).json(resDoc);
  });

  getInnovative = catchError(async (req, res, next) => {
    const innovativeFurnitures = await innovativeFurnituresService.getInnovative();
    const resDoc = responseHandler(200, "Innovative retrieved successfully", innovativeFurnitures);
    res.status(200).json(resDoc);
  });

  getInnovativesByPagination = catchError(async (req, res, next) => {
    const { page, limit, order } = req.query;
    const innovativeFurnitures = await innovativeFurnituresService.getInnovativesByPagination({ page: parseInt(page), limit: parseInt(limit), order });
    const resDoc = responseHandler(200, "Innovative retrieved successfully", innovativeFurnitures);
    res.status(200).json(resDoc);
  });

  getInnovativeById = catchError(async (req, res, next) => {
    const innovativeFurnitures = await innovativeFurnituresService.getInnovativeById(req.params.id);
    const resDoc = responseHandler(200, "Innovative retrieved successfully", innovativeFurnitures);
    res.status(200).json(resDoc);
  });

  deleteInnovative = catchError(async (req, res, next) => {
    await innovativeFurnituresService.deleteInnovative(req.params.id);
    const resDoc = responseHandler(200, "Innovative deleted successfully");
    res.status(200).json(resDoc);
  });
}

export default new InnovativeFurnituresController();