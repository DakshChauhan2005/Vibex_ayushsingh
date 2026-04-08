import { Router } from "express";
import { getProfile, getProviders, updateProfile } from "../controller/user.controller.js";
import { authUser } from "../middleware/auth.middleware.js";
import { providerFilterValidation, updateProfileValidation } from "../validator/user.validator.js";

const router = Router();

router.get("/profile", authUser, getProfile);
router.put("/profile", authUser, updateProfileValidation, updateProfile);
router.get("/providers", providerFilterValidation, getProviders);

export default router;
