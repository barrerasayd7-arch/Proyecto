import express from "express";
import cors from "cors";
import servicesRoutes from "./src/routes/service.routes.js";
import { connectDB } from "./src/config/db.js";

const app = express();
connectDB();

// ✅ CORS aquí
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.use("/api/services", servicesRoutes);

app.listen(3000, () => {
  console.log("🚀 Servidor en puerto 3000");
});