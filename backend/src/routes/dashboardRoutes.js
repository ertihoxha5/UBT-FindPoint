import express from "express";
import { getDashboardStatsPublic } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", getDashboardStatsPublic);

export default router;