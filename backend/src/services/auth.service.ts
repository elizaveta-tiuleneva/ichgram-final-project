import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import User from "../models/User.js";

interface RegisterData {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const expiresIn = (
    process.env.JWT_EXPIRES_IN || "7d"
  ) as SignOptions["expiresIn"];

  return jwt.sign({ userId }, secret, { expiresIn });
};

// Регистрация пользователя
export const registerUser = async (data: RegisterData) => {
  const username = data.username.trim().toLowerCase();
  const email = data.email.trim().toLowerCase();
  const fullName = data.fullName.trim();

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new Error("Email or username already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    username,
    fullName,
    email,
    password: hashedPassword
  });

  const token = generateToken(String(user._id));

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar
    }
  };
};

// Авторизация пользователя
export const loginUser = async (data: LoginData) => {
  const email = data.email.trim().toLowerCase();

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(String(user._id));

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar
    }
  };
};
