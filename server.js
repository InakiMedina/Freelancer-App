import express from 'express'
import mongoose from "mongoose";
import cors from 'cors'
import path from 'path'
import cookieParse from "cookie-parser"
import dotenv from "dotenv";

// server.js (versión unificada ESM)
import path, { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Necesario para obtener __dirname con ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import router from './App/backend/router.js'

// make easy for the html files to call the css/js/images
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParse())
app.use(express.static(path.join(__dirname, "app", "frontend")));
app.use(router)

// Servir archivos del frontend
app.use(express.static(path.join(__dirname, "app", "frontend")));

// Servir archivos subidos (imagenes, portafolios)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MONGODB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/freelancer")
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error MongoDB:", err));

// RUTAS BACKEND
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import router from "./App/backend/router.js"; // tu router principal

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/upload", uploadRoutes);

// Tu router principal
app.use(router);

// LISTAR ARCHIVOS SUBIDOS
import User from "./models/User.js";

app.get("/api/files/list", async (req, res) => {
  try {
    const users = await User.find({}, "name profileImage portfolio");

    res.json({
      success: true,
      totalUsers: users.length,
      users: users.map((user) => ({
        name: user.name,
        hasAvatar: !!user.profileImage,
        portfolioCount: user.portfolio ? user.portfolio.length : 0,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//INICIAR SERVIDOR
app.listen(port, () => {
  console.log(`Servidor corriendo en: http://localhost:${port}`);
  console.log(`Archivos locales en: ${path.join(__dirname, "uploads")}`);
});
