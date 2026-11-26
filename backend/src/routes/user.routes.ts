import { Router } from "express";

import {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { uploadSingleImage } from "../middleware/upload.middleware.js";

const router = Router();

router.patch("/me", authenticate, updateProfile);

router.post(
  "/me/avatar",
  authenticate,
  uploadSingleImage,
  uploadAvatar,
);

router.delete(
  "/me/avatar",
  authenticate,
  removeAvatar,
);

router.get("/:id", authenticate, getProfile);

export default router;