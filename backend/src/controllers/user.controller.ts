import { type Request, type Response } from "express";
import { type AuthRequest } from "../middleware/auth.middleware.js";

import {
  getUserProfile,
  updateUserProfile,
  updateUserAvatar,
  deleteUserAvatar,
} from "../services/user.service.js";

const handleProfileError = (
  error: unknown,
  res: Response,
): void => {
  if (error instanceof Error) {
    if (error.message === "Invalid user ID") {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    if (error.message === "User not found") {
      res.status(404).json({
        message: error.message,
      });
      return;
    }

    if (
      error.message === "This username is already taken." ||
      ("code" in error && error.code === 11000)
    ) {
      res.status(409).json({
        message: "This username is already taken.",
      });
      return;
    }

    if (error.name === "ValidationError") {
      res.status(400).json({
        message: error.message,
      });
      return;
    }
  }

  console.error("Profile error:", error);

  res.status(500).json({
    message: "Internal server error",
  });
};

export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.params.id;

    if (typeof userId !== "string") {
      res.status(400).json({
        message: "Invalid user ID",
      });
      return;
    }

    const user = await getUserProfile(userId);

    res.status(200).json(user);
  } catch (error) {
    handleProfileError(error, res);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const { fullName, username, bio, website } = req.body ?? {};

    if (
      fullName === undefined &&
      username === undefined &&
      bio === undefined &&
      website === undefined
    ) {
      res.status(400).json({
        message: "No profile fields provided.",
      });
      return;
    }

    if (
      fullName !== undefined &&
      (
        typeof fullName !== "string" ||
        !fullName.trim() ||
        fullName.trim().length > 100
      )
    ) {
      res.status(400).json({
        message: "Full name must contain 1–100 characters.",
      });
      return;
    }

    if (
      username !== undefined &&
      (
        typeof username !== "string" ||
        !/^[a-zA-Z0-9._]{3,30}$/.test(username.trim())
      )
    ) {
      res.status(400).json({
        message: "Username must contain 3–30 valid characters.",
      });
      return;
    }

    if (
      bio !== undefined &&
      (
        typeof bio !== "string" ||
        bio.trim().length > 150
      )
    ) {
      res.status(400).json({
        message: "Bio must not exceed 150 characters.",
      });
      return;
    }

    if (website !== undefined) {
      if (
        typeof website !== "string" ||
        website.trim().length > 2048
      ) {
        res.status(400).json({
          message: "Invalid website URL.",
        });
        return;
      }

      if (website.trim()) {
        try {
          const url = new URL(website.trim());

          if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
          ) {
            throw new Error("Invalid protocol");
          }
        } catch {
          res.status(400).json({
            message: "Website must be a valid HTTP or HTTPS URL.",
          });
          return;
        }
      }
    }

    const user = await updateUserProfile(req.userId, {
      fullName,
      username,
      bio,
      website,
    });

    res.status(200).json(user);
  } catch (error) {
    handleProfileError(error, res);
  }
};

export const uploadAvatar = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: "Image is required.",
      });
      return;
    }

    const result = await updateUserAvatar(
      req.userId,
      req.file,
    );

    res.status(200).json({
      message: "Avatar updated successfully.",
      avatar: result.avatar,
    });
  } catch (error) {
    handleProfileError(error, res);
  }
};

export const removeAvatar = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const result = await deleteUserAvatar(req.userId);

    res.status(200).json({
      message: "Avatar removed successfully.",
      avatar: result.avatar,
    });
  } catch (error) {
    handleProfileError(error, res);
  }
};