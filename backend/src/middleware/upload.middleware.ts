import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { type Request, type Response, type NextFunction } from "express";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error("Only JPEG, PNG and WebP images are allowed."));
      return;
    }

    callback(null, true);
  },
});

export const uploadSingleImage = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single("image")(req, res, async (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({
          message: "Image size must not exceed 5 MB.",
        });
        return;
      }

      res.status(400).json({
        message: error.message,
      });
      return;
    }

    if (error) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: "Image is required.",
      });
      return;
    }

    try {
      const detectedType = await fileTypeFromBuffer(req.file.buffer);

      if (
        !detectedType ||
        !allowedMimeTypes.includes(detectedType.mime) ||
        detectedType.mime !== req.file.mimetype
      ) {
        res.status(400).json({
          message: "Invalid image format.",
        });
        return;
      }

      next();
    } catch {
      res.status(400).json({
        message: "Unable to validate image.",
      });
    }
  });
};