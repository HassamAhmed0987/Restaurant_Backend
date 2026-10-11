import { Router } from 'express';
import { getCart, updateItemQuantity, clearCart, addItem, removeItem } from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get("/", getCart)
router.delete("/", clearCart)
router.post("/items", addItem)
router.patch("/items/:menuItemId", updateItemQuantity)
router.delete("/items/:menuItemId", removeItem)

export default router;