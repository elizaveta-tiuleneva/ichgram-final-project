import type { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";
import User from "../models/User.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { getImageUrl } from "../services/s3.service.js";

// Регистрация
export const register = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, fullName, email, password } = req.body ?? {};

    if (
      typeof username !== "string" ||
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !fullName.trim() ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        message: "All fields are required",
      });
      return;
    }

    if (!/^[a-zA-Z0-9._]{3,30}$/.test(username.trim())) {
      res.status(400).json({
        field: "username",
        message: "Invalid username",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({
        field: "email",
        message: "Invalid email address",
      });
      return;
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      res.status(400).json({
        field: "password",
        message:
          "Password must contain at least 8 characters and no more than 72 bytes",
      });
      return;
    }

    const result = await registerUser({
      username,
      fullName,
      email,
      password,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "This email is already registered.") {
        res.status(409).json({
          field: "email",
          message: error.message,
        });
        return;
      }

      if (error.message === "This username is already taken.") {
        res.status(409).json({
          field: "username",
          message: error.message,
        });
        return;
      }
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      const duplicateError = error as {
        keyPattern?: Record<string, number>;
      };

      if (duplicateError.keyPattern?.username) {
        res.status(409).json({
          field: "username",
          message: "This username is already taken.",
        });
        return;
      }

      if (duplicateError.keyPattern?.email) {
        res.status(409).json({
          field: "email",
          message: "This email is already registered.",
        });
        return;
      }

      res.status(409).json({
        message: "Email or username already exists",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Авторизация
export const login = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { identifier, email, password } = req.body ?? {};

    const loginIdentifier = identifier ?? email;

    if (
      typeof loginIdentifier !== "string" ||
      typeof password !== "string" ||
      !loginIdentifier.trim() ||
      !password ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      res.status(400).json({
        message: "Username or email and password are required",
      });
      return;
    }

    const result = await loginUser({
      identifier: loginIdentifier,
      password,
    });

    res.status(200).json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid username, email or password"
    ) {
      res.status(401).json({
        message: error.message,
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Получение текущего пользователя
export const getMe = async (
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

    const user = await User.findById(req.userId)
      .select("-password -__v");

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      ...user.toObject(),
      avatar: await getImageUrl(user.avatar),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};