import { Router } from "express";
import {
  createService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
} from "../controller/service.controller.js";
import { authUser } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  createServiceValidation,
  getServiceByIdValidation,
  listServiceValidation,
  updateServiceValidation,
} from "../validator/service.validator.js";

const router = Router();

router.post("/", authUser, allowRoles("provider", "admin"), createServiceValidation, createService);
router.get("/", listServiceValidation, getServices);
router.get("/:id", getServiceByIdValidation, getServiceById);
router.put("/:id", authUser, updateServiceValidation, updateService);
router.delete("/:id", authUser, getServiceByIdValidation, deleteService);

export default router;
