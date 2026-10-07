import { Router } from 'express';
import {
    createCategory,
    getCategoriesByRestaurant,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/categories/:categoryId', getCategoryById);
router.get('/restaurants/:restaurantId/categories', getCategoriesByRestaurant);

// Private Routes
router.post('/:restaurantId/categories', authenticate, authorize('super_admin', 'admin'), createCategory);
router.patch('/categories/:categoryId', authenticate, authorize('super_admin', 'admin'), updateCategory);
router.delete('/categories/:categoryId', authenticate, authorize('super_admin', 'admin'), deleteCategory);

export default router;