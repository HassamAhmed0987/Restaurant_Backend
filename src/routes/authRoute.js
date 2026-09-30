import { Router } from "express";
import { userlogin, userRegister } from "../controllers/auth.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router()



router.post("/register", userRegister)
router.post("/login", userlogin)


export default router