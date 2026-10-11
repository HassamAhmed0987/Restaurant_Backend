import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true // Snapshot of item name at the time of order
    },
    price: {
        type: Number,
        required: true // Snapshot of item price at the time of order
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    subtotal: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    items: [orderItemSchema],
    deliveryAddress: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'COD' // e.g. COD, Online, Card
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    orderStatus: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'preparing',
            'ready',
            'out_for_delivery',
            'delivered',
            'cancelled',
            'rejected'
        ],
        default: 'pending'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.model('Order', orderSchema);    