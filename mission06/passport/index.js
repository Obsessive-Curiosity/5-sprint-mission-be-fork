import passport from "passport";
import local from "./localStrategy.js";
import User from "../models/User.js";

const passportConfigure = () => {
  passport.serializeUser((user, done) => {
    console.log("serialize");
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    console.log("deserialize");
    try {
      const user = await User.findById(id);
      console.log("user", user);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  local();
};

export default passportConfigure;
