import { Router } from "express";
import { getCategoriesByRestaurant } from "../controllers/categoryController.js";



const router = Router()


router.get("/:restaurantId/categories", getCategoriesByRestaurant)






export default router