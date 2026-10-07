import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'Restaurant ID is required for category'],
        },
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        // image: {
        //     type: String,
        //     default: '',
        // },
        sortOrder: {
            type: Number,
            default: 0, 
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Category', categorySchema);



















