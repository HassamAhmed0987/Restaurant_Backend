import express from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getOrdersByRestaurant
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer Routes
router.post('/', authenticate, authorize('CUSTOMER'), createOrder);
router.get('/my-orders', authenticate, authorize('CUSTOMER'), getUserOrders);

// Shared / Specific Order Route
router.get('/:id', authenticate, getOrderById);

// Admin / Super Admin Status Update Route
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateOrderStatus);
router.get('/restaurant/:restaurantId', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), getOrdersByRestaurant)

export default router;