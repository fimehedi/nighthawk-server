import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config/config.mjs';
import { Admin } from '../../models/admin/admin.model.mjs';
import { Role } from '../../models/role/role.model.mjs';
class AdminService {
	async createAdmin(payload) {
		// find the role with the name 'admin' if not found create it
		let role = await Role.findOne({ name: 'admin' });

		if (!role) {
			role = await Role.create({ name: 'admin' });
			role.save();
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(payload.password, salt);

		// create the admin
		const admin = new Admin({
			...payload,
			password: hashedPassword,
			role: role._id,
		});

		await admin.save();

		delete admin._doc.password;

		return admin;
	}

	async loginAdmin(payload) {
		const { email, password } = payload;
		const admin = await Admin.findOne({ email })
			.populate('role')
			.select('+password');

		if (!admin) {
			throw new Error('Invalid email or password');
		}

		const validPassword = await bcrypt.compare(password, admin.password);
		if (!validPassword) {
			throw new Error('Invalid email or password');
		}

		// jwt

		const token = jwt.sign(
			{
				_id: admin._id,
				email: admin.email,
				role: admin.role,
			},
			config.jwt_secret,
			{
				expiresIn: '25h',
			}
		);

		return {
			_id: admin._id,
			email: admin.email,
			role: admin.role,
			token,
		};
	}

	async updateAdmin(id, payload) {
		const admin = await Admin.findByIdAndUpdate(
			id,
			{
				$set: payload,
			},
			{ new: true }
		);
		return admin;
	}

	async getAdmins() {
		const admins = await Admin.find().populate('role').select('-password');
		return admins;
	}

	async getAdmin(id) {
		const admin = await Admin.findById(id).populate('role').select('-password');
		return admin;
	}

	async deleteAdmin(id) {
		await Admin.findByIdAndDelete(id);
	}
}

export default new AdminService();
