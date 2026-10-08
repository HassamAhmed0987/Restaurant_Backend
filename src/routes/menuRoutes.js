import express from 'express';
import {
    createMenuItem,
    getAllMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem
} from '../controllers/menuItemController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);

// Protected Routes (SUPER_ADMIN & ADMIN)
router.post('/', authenticate, authorize('super_admin', 'admin'), createMenuItem);
router.put('/:id', authenticate, authorize('super_admin', 'admin'), updateMenuItem);
router.delete('/:id', authenticate, authorize('super_admin', 'admin'), deleteMenuItem);

export default router;