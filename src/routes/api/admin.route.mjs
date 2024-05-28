import { Router } from "express";
import adminController from "../../modules/admin/admin.controller.mjs";

const adminRouter = Router();

adminRouter
  .route("/:id")
  .get(adminController.getAdmin)
  .put(adminController.updateAdmin);

adminRouter
  .route("/")
  .post(adminController.createAdmin)
  .get(adminController.getAdmins)
  .delete(adminController.deleteAdmin);

adminRouter.post("/login", adminController.loginAdmin);

export default adminRouter;