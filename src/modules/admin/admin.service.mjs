import { Admin } from "../../models/admin/admin.model.mjs";
import { Role } from "../../models/role/role.model.mjs";

class AdminService {

  async createAdmin(payload) {
    // find the role with the name 'admin' if not found create it
    let role = await Role.findOne({ name: "admin" });

    if (!role) {
      role = await Role.create({ name: "admin" });
      role.save();
    }

    console.log(role);

    // create the admin
    const admin = new Admin({
      ...payload,
      role: role._id,
    });

    await admin.save();

    return admin;
  }

  async updateAdmin(id, payload) {
    const admin = await Admin.findByIdAndUpdate
      (id,
        {
          $set: payload,
        },
        { new: true }
      );
    return admin;
  }

  async getAdmins() {
    const admins = await Admin.find().populate("role");
    return admins;
  }

  async getAdmin(id) {
    const admin = await Admin.findById(id).populate("role");
    return admin;
  }

  async deleteAdmin(id) {
    await Admin.findByIdAndDelete(id);
  }

}

export default new AdminService();