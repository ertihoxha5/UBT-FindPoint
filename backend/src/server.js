import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./initDb.js";
import authRoutes from "./routes/authRoutes.js";
//import itemRoutes from "./routes/itemRoutes.js";

dotenv.config();

const app = express();

initDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// app.use("/api", itemRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});