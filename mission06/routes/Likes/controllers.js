import express from "express";
import { verifyToken } from "../../middlewares/index.js";
import { addLikes, cancelLikes } from "./service.js";

const router = express.Router();

router.post("/", verifyToken, addLikes);
router.delete("/", verifyToken, cancelLikes);

export default router;
