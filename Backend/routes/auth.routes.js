import {Router} from "express";
import { loginValidator, registerValidation } from "../validator/auth.validator.js";
import { getMe, login, register } from "../controller/auth.controller.js";
import { authUser } from "../middleware/auth.middleware.js";
const router = Router();


/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { name: String, email: String, password: String, role?: "user" | "provider", location?: String }
 */
router.post("/register", registerValidation, register )

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email: String, password: String }
 */
router.post("/login", loginValidator , login )


/**
 * @route GET /api/auth/me
 * @desc Get current logged in user details
 * @access Private
 */
router.get("/me", authUser , getMe)

export default router;