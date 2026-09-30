import User from "../models/user.js";
import bcrypt from "bcryptjs";
import Restaurant from "../models/restaurant.js";


export const getMe = async (req, res) => {
    try {

        console.log(req.user);


        const user = await User.findById(req.user._id).select("-password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: user
        })


    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


export const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body

        const updates = {}

        if (name) {
            updates.name = name
        }
        if (phone) {
            updates.phone = phone
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        )

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both current password and new password are required"
            })
        }

        const user = await User.findById(req.user._id).select("+password")

        const isMatch = await bcrypt.compare(currentPassword, user.password)

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect current password"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)

        user.password = hashedPassword

        await user.save()

        return res.status(200).json({
            success: true,
            message: "Password changed successfully. Please login again with your new password."
        });



    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}



export const createRestaurantAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, restaurantId } = req.body;

        // 1. Basic Input Validation
        if (!name || !email || !password || !restaurantId) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password, and restaurantId are required."
            });
        }

        // 2. Check if Restaurant exists
        const restaurantExists = await Restaurant.findById(restaurantId);
        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: "Target restaurant not found."
            });
        }

        // 3. Check if User Email already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists."
            });
        }

        // 4. Hash Password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 5. Create ADMIN User with restaurantId link
        const adminUser = await User.create({
            name,
            email,
            password: hashedPassword,
            phone: phone || "",
            role: 'admin',
            restaurantId: restaurantId
        });

        return res.status(201).json({
            success: true,
            message: "Restaurant Admin created successfully!",
            data: {
                id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                restaurantId: adminUser.restaurantId
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const getAllAdmins = async (req, res) => {

    try {
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            })
        }

        const admins = await User.find({ role: "admin" }).select("-password").populate('restaurantId', 'name city status')

        return res.status(200).json({
            success: true,
            count: admins.length,
            data: admins
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


export const getAdminById = async (req, res) => {

    try {
        const { id } = req.param.id
        if (req.user.role !== "super_admin") {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            })
        }

        const admin = await User.findById(id).select("-password").populate('restaurantId', 'name city status')

        return res.status(200).json({
            success: true,
            data: admin
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

