import Order from '../models/order.js';
import Cart from '../models/cart.js';
import Restaurant from '../models/restaurant.js';

// Helper function to generate a unique order number e.g. ORD-1728564123-ABC
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}-${randomStr}`;
};

// 1. Create Order (Checkout from Cart)
export const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { deliveryAddress, phone, paymentMethod, notes } = req.body;

        if (!deliveryAddress || !phone) {
            return res.status(400).json({
                success: false,
                message: "Delivery address and phone number are required."
            });
        }

        // Find user's active cart
        const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. Add items before checking out."
            });
        }

        // Verify Restaurant is still active
        const restaurant = await Restaurant.findById(cart.restaurant);
        if (!restaurant || !restaurant.isActive) {
            return res.status(400).json({
                success: false,
                message: "The restaurant is currently inactive or closed. Cannot place order."
            });
        }

        // Prepare order items snapshot (storing name & price at the time of order)
        const orderItems = cart.items.map(cartItem => {
            const menuItem = cartItem.menuItem;
            return {
                menuItem: menuItem._id,
                name: menuItem.name,
                price: cartItem.price,
                quantity: cartItem.quantity,
                subtotal: cartItem.price * cartItem.quantity
            };
        });

        // Create the Order
        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            user: userId,
            restaurant: cart.restaurant,
            items: orderItems,
            deliveryAddress,
            phone,
            subtotal: cart.subtotal,
            deliveryFee: cart.deliveryFee || 0,
            discount: cart.discount || 0,
            total: cart.total,
            paymentMethod: paymentMethod || 'COD',
            paymentStatus: paymentMethod === 'Online' ? 'pending' : 'pending',
            notes: notes || ''
        });

        // Clear the Cart after successful order placement
        await Cart.findByIdAndDelete(cart._id);

        return res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            data: order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 2. Get User Orders (Customer apna order history dekh sake)
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.find({ user: userId })
            .populate('restaurant', 'name phone address')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 3. Get Single Order Details By ID
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('restaurant', 'name phone address image')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Authorization check: User sirf apna order dekh sakay, ya Super Admin / Assigned Admin
        const isCustomer = order.user._id.toString() === req.user._id.toString();
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const isAssignedAdmin = req.user.role === 'ADMIN' && req.user.restaurantId?.toString() === order.restaurant._id.toString();

        if (!isCustomer && !isSuperAdmin && !isAssignedAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized to view this order."
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 4. Update Order Status (Restaurant Admin / Super Admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, paymentStatus } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Authorization check for Admin
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const isAssignedAdmin = req.user.role === 'ADMIN' && req.user.restaurantId?.toString() === order.restaurant.toString();

        if (!isSuperAdmin && !isAssignedAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You cannot modify orders of this restaurant."
            });
        }

        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully!",
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 5. Get Orders by Restaurant (For Restaurant Admin & Super Admin)
export const getOrdersByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { status } = req.query; // Optional filter: e.g. ?status=pending

        // Authorization check: Super Admin sab dekh sakta hai, Admin sirf apna assigned restaurant
        const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
        const isAssignedAdmin = req.user.role === 'ADMIN' && req.user.restaurantId?.toString() === restaurantId;

        if (!isSuperAdmin && !isAssignedAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not authorized to view orders for this restaurant."
            });
        }

        const filter = { restaurant: restaurantId };
        if (status) {
            filter.orderStatus = status;
        }

        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


