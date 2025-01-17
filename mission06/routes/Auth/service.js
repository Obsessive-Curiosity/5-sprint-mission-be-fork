import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET;

export const signup = async (req, res, next) => {
  const { email, nick, password, passwordConfirmation } = req.body;

  try {
    if (password !== passwordConfirmation) {
      return res
        .status(404)
        .send({ message: "비밀번호와 비밀번호 확인이 서로 다릅니다." });
    }

    const exUser = await User.findOne({ email });

    if (exUser) {
      return res
        .status(409)
        .send({ success: false, message: "이미 존재하는 이메일입니다." });
    }

    const hash = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      email,
      nick,
      password: hash,
    });

    res.status(201).send(newUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const exUser = await User.findOne({ email }); // 사용자 찾기

    // 이메일 확인
    if (!exUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }
    // 비밀번호 확인
    if (!(await bcrypt.compare(password, exUser.password))) {
      return res.status(404).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // JWT 토큰 생성
    const accessToken = generateAccessToken(exUser);
    const refreshToken = generateRefreshToken(exUser);

    // RefreshToken을 HTTP-only 쿠키로 설정
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // JavaScript로 접근 불가
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 유효
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
      sameSite: "strict", // CSRF 공격 방지
    });

    res.status(200).json({
      success: true,
      message: "로그인 되었습니다.",
      accessToken,
      user: { id: exUser._id, email: exUser.email, nick: exUser.nick },
    });
  } catch (error) {
    console.error(error);
  }
};

export const refresh = async (req, res) => {
  // 쿠키에서 RefreshToken 읽기
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh 토큰이 없습니다." });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const exUser = await User.findById(decoded.id);

    if (!exUser) {
      return res.status(401).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const newAccessToken = generateAccessToken(exUser);
    const newRefreshToken = generateRefreshToken(exUser);

    // 새로운 RefreshToken을 쿠키로 설정
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "유효하지 않은 refresh 토큰입니다." });
  }
};

export const logout = (req, res) => {
  // JWT는 서버 측에서 저장하지 않으므로, 클라이언트에게 토큰을 삭제하라고 지시
  res.status(200).json({ message: "로그아웃 되었습니다." });
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, nick: user.nick },
    SECRET_KEY,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, REFRESH_SECRET_KEY, {
    expiresIn: "1h",
  });
};
