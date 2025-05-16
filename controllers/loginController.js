import User from "../models/Users.js";
import { compare } from "bcrypt";
import JWT from "jsonwebtoken";

import { readFileSync } from "fs";


export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await  User.findOne({
      email
    });

    if (user) {
      const isValidPassword = await compare(password, user.password);
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
}

function genrateWebToken(user) {
  const privateKey = readFileSync("./private.pem", "utf-8");
  const token = JWT.sign(user.id, privateKey, { algorithm: "RS256" });
  return token;
}