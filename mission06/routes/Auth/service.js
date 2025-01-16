import bcrypt from "bcrypt";
import passport from "passport";
import User from "../../models/User.js";

export const join = async (req, res, next) => {
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

export const login = (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }

    if (!user) {
      return res.status(404).send({
        message: info,
      });
    }

    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }

      res.status(200).send({
        success: true,
        message: "로그인 되었습니다.",
        user: { id: user._id, email: user.email, nick: user.nick },
      });
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙임
};

export const logout = (req, res) => {
  req.logout((logoutError) => {
    if (logoutError) {
      console.error(logoutError);
      return res.status(500).send({ message: "로그아웃 실패" });
    }
    res.status(200).send({ message: "로그아웃 되었습니다." });
  });
};
