import { Router } from "express";
import { getProviderDashboard } from "../controller/provider.controller.js";
import { authUser } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = Router();

router.get("/dashboard", authUser, allowRoles("provider", "admin"), getProviderDashboard);

export default router;
