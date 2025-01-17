import express from "express";
import { addLikes, deleteLikes } from "./service.js";

const router = express.Router();

router.post("/", addLikes);
router.delete("/", deleteLikes);

export default router;
