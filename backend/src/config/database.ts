import mongoose from "mongoose";

// Подключение к MongoDB
export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI; // Адрес базы данных

    if (!uri) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(uri); // Подключение к базе

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Остановка приложения при ошибке
  }
};
