import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import passportConfig from "./passport/index.js";
import router from "./routes/index.js";

dotenv.config();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

const app = express();
passportConfig(); // passport 설정

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    name: "session-cookie",
  })
);
app.use(passport.initialize()); // req 객체에 passport 저장
app.use(passport.session()); // req.session에 passport 저장

mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("몽고디비 연결 성공^^"))
  .catch((err) => console.log(err));

// "/"로 시작하는 요청에서 미들웨어 실행
app.use("/", router);

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send(err.message);
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});
