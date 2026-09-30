import { Schema } from "mongoose";
import mongoose from "mongoose";

const restaurantSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Restaurant name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Restaurant owner (Super Admin/Admin) reference is required'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Restaurant email is required'],
            lowercase: true,
            unique: true,
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'Address is required'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        // image: {
        //     type: String,
        //     default: '', // Image URL ya Cloudinary/Supabase file path
        // },
        openingTime: {
            type: String,
            default: '09:00 AM', // Format e.g., "09:00 AM" ya "09:00"
        },
        closingTime: {
            type: String,
            default: '11:00 PM', // Format e.g., "11:00 PM" ya "23:00"
        },
        isOpen: {
            type: Boolean,
            default: true, // Daily operational status (Open/Closed for orders)
        },
        isActive: {
            type: Boolean,
            default: true, // Platform status (Super Admin isey false karke restaurant deactivate kar sakta hai)
        },
    },
    {
        timestamps: true, // Yeh automatic `createdAt` aur `updatedAt` create kar deta hai
    }
);

export default mongoose.model('Restaurant', restaurantSchema);




