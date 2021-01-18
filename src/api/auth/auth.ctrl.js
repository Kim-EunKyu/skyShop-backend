import Joi from "joi";
import User from "../../models/user";

export const register = async (req, res) => {
  const schema = Joi.object().keys({
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().required(),
  });
  const result = schema.validate(req.body);
  if (result.error) {
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  const { username, password } = req.body;
  try {
    const exists = await User.findByUsername(username);
    if (exists) {
      res.status(409).json({ error: "Confilct" });
      return;
    }

    const user = new User({
      username,
    });
    await user.setPassword(password);
    await user.save();

    const token = user.generateToken();
    res.cookie("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });
    res.json(user.serialize());
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const valid = await user.checkPassword(password);
    if (!valid) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = user.generateToken();
    res.cookie("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });
    res.json(user.serialize());
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const check = async (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(user);
};

export const logout = async (req, res) => {
  res.clearCookie("access_token");
  res.status(204).json("No Content");
};
