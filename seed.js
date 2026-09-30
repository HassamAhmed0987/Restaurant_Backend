import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/user.js';
import { configDotenv } from 'dotenv';

configDotenv()

const createInitialSuperAdmin = async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    const hashedPassword = await bcrypt.hash("SuperAdminPass123!", 12);

    await User.create({
        name: "Platform Super Admin",
        email: "superadmin@system.com",
        password: hashedPassword,
        role: "super_admin"
    });

    console.log("Super Admin Created Successfully!");
    process.exit();
};

createInitialSuperAdmin();