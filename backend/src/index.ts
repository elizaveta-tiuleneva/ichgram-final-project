
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";

dotenv.config(); // Загружаем переменные окружения

const app = express(); // Создаём Express-приложение
const PORT = Number(process.env.PORT) || 5000; // Порт сервера

app.use(cors()); // Разрешаем запросы от Frontend
app.use(express.json()); // Обрабатываем JSON-запросы

// Главная страница API
app.get("/", (_req, res) => {
  res.json({ message: "Welcome to ICHgram API" });
});

// Проверка работы сервера
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "ICHgram server is running"
  });
});

// Подключение к базе данных и запуск сервера
const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ICHgram API running on http://localhost:${PORT}`);
  });
};

startServer();
