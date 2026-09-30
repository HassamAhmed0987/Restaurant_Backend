import { Router } from "express";
import { changePassword, createRestaurantAdmin, getAdminById, getAllAdmins, getMe, updateProfile } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router()


router.get("/me",authenticate, getMe)
router.patch("/me", authenticate, updateProfile)
router.patch("/changed-password", authenticate, changePassword)
router.post("/create-admin", authenticate, authorize("super_admin"), createRestaurantAdmin)

router.get("/admins", authenticate, authorize("super_admin"), getAllAdmins)
router.get("/admins/:id", authenticate, authorize("super_admin"), getAdminById)


export default router