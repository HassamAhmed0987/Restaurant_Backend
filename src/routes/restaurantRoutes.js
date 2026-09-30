import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { createRestaurant, getAllRestaurants, getRestaurantById, toggleRestaurantStatus, updateRestaurant } from "../controllers/restaurantController.js";

const router = Router()

router.get("/", getAllRestaurants)
router.get("/:id", getRestaurantById)

router.post("/", authenticate, authorize("super_admin"), createRestaurant)
router.put("/:id", authenticate, authorize("super_admin", "admin"), updateRestaurant)
router.patch("/:id/status", authenticate, authorize("super_admin"), toggleRestaurantStatus)


export default router