const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const fs = require("fs");

require("dotenv").config();

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email
    });

    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (isValidPassword) {
        const token = genrateWebToken(user);

        res.status(200).json({ token: token });
      } else {
        res.status(401).json({
          message: "Password doesn't match!!!",
        });
      }
    } else {
      res.status(404).json({
        message: "User doesn't exist",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

function genrateWebToken(user) {
  const privateKey = fs.readFileSync("./private.pem", "utf-8");
  const token = jwt.sign(user.id, privateKey, { algorithm: "RS256" });
  return token;
}