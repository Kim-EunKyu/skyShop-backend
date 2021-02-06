import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import api from "./api";
import jwtMiddleware from "./lib/jwtMiddleware";

//env설정 가져오기
dotenv.config();

const { PORT, MONGO_URI } = process.env;
const app = express();

//몽고DB연결
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.error(e);
  });

//middleware 등록
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(jwtMiddleware);
app.use(
  cors({
    origin: "https://compassionate-austin-862a3c.netlify.app/", // 허락하고자 하는 요청 주소
    credentials: true, // true로 하면 설정한 내용을 response 헤더에 추가 해줍니다.
  })
);

//router 설정
app.use("/api", api);

//서버 실행
const port = PORT || 5000;
app.listen(port, () => {
  console.log("server open");
});
