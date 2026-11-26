import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

import {
  s3Client,
  S3_BUCKET_NAME,
} from "../config/s3.js";

type ImageFolder = "avatars" | "posts";

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const uploadImage = async (
  file: Express.Multer.File,
  folder: ImageFolder
): Promise<string> => {
  const extension = imageExtensions[file.mimetype];

  if (!extension) {
    throw new Error("Unsupported image format");
  }

  const key = `${folder}/${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  return key;
};

export const getImageUrl = async (
  key: string
): Promise<string> => {
  if (!key) {
    return "";
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });
};

export const deleteImage = async (
  key: string
): Promise<void> => {
  if (!key) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};