import express from "express";
import mongoose from "mongoose";
import { DATABASE_URL } from "./env.js";
import router from "./routes/index.js";

const app = express();
const PORT = 8000;

app.use(express.json());

mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("몽고디비 연결 성공^^"))
  .catch((err) => console.log(err));

app.use("/", router);

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
