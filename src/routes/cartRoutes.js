import { Router } from 'express';
import { getCart, updateItemQuantity, clearCart, addItem, removeItem } from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get("/", getCart)
router.delete("/", clearCart)
router.post("/items", addItem)
router.patch("/items/:menuItemId", updateItemQuantity)
router.delete("/items/:menuItemId", removeItem)

export default router;