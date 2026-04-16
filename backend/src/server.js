import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./initDb.js";

//import itemRoutes from "./routes/itemRoutes.js";

dotenv.config();

const app = express();

initDB();

app.use(cors());
app.use(express.json());

// app.use("/api", itemRoutes);

app.get("/", (req, res) => {    
    res.send("Welcome to the Inventory Management System API");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});