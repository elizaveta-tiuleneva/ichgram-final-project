import mongoose from "mongoose";
import User from "../models/User.js";

import {
  uploadImage,
  getImageUrl,
  deleteImage,
} from "./s3.service.js";

interface UpdateProfileData {
  fullName?: string;
  username?: string;
  bio?: string;
  website?: string;
}

const removeImageSafely = async (key: string): Promise<void> => {
  try {
    await deleteImage(key);
  } catch (error) {
    console.error("S3 image cleanup error:", error);
  }
};

export const getUserProfile = async (userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findById(userId)
    .select("-password -email -__v");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    ...user.toObject(),
    avatar: await getImageUrl(user.avatar),
  };
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileData,
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const updates: UpdateProfileData = {};

  if (data.fullName !== undefined) {
    updates.fullName = data.fullName.trim();
  }

  if (data.username !== undefined) {
    const username = data.username.trim().toLowerCase();

    const existingUser = await User.findOne({
      username,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new Error("This username is already taken.");
    }

    updates.username = username;
  }

  if (data.bio !== undefined) {
    updates.bio = data.bio.trim();
  }

  if (data.website !== undefined) {
    updates.website = data.website.trim();
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password -__v");

  if (!user) {
    throw new Error("User not found");
  }

  return {
    ...user.toObject(),
    avatar: await getImageUrl(user.avatar),
  };
};

export const updateUserAvatar = async (
  userId: string,
  file: Express.Multer.File,
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newAvatarKey = await uploadImage(file, "avatars");

  const previousUser = await (async () => {
    try {
      const result = await User.findByIdAndUpdate(
        userId,
        { $set: { avatar: newAvatarKey } },
        { new: false },
      );

      if (!result) {
        throw new Error("User not found");
      }

      return result;
    } catch (error) {
      await removeImageSafely(newAvatarKey);
      throw error;
    }
  })();

  if (previousUser.avatar) {
    await removeImageSafely(previousUser.avatar);
  }

  return {
    avatar: await getImageUrl(newAvatarKey),
  };
};

export const deleteUserAvatar = async (userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  const previousUser = await User.findByIdAndUpdate(
    userId,
    { $set: { avatar: "" } },
    { new: false },
  );

  if (!previousUser) {
    throw new Error("User not found");
  }

  if (previousUser.avatar) {
    await removeImageSafely(previousUser.avatar);
  }

  return {
    avatar: "",
  };
};