import mongoose, { Schema } from "mongoose";


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["super_admin", "admin", "customer"],
        default: "customer"
    },
    status: {
        type: String,
        enum: ["active", "blocked"],
        default: "active"
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        default: null,
    }

},
    {
        timestamps: true
    }
)



export default mongoose.model("User", userSchema)