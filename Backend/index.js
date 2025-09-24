import express from "express";
import dotenv from "dotenv";
import chatRoutes from "./routers/chatbot.router.js";
import connectDB from "./connectDB/connectdb.js";
import cors from "cors"
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ["GET", "POST"],
  credentials: true
}));

app.use("/api", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
