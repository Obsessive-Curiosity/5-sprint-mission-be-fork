import express from "express";
import authRouter from "./Auth/controllers.js";
import productRouter from "./Product/controllers.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/product", productRouter);

export default router;
