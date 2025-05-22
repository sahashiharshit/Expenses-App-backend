import { createTransport } from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import ForgotPasswordRequest from "../models/ForgotPasswordRequest.js";
import User from "../models/Users.js";
import { hash } from "bcrypt";

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(404).json({ message: "Account doesn't exist" });
    }

    const resetToken = uuidv4();

    const resetLink = `https://expenses-app-ja1q.onrender.com/reset-password.html?token=${resetToken}`;

    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `<h1>Password Reset Request</h1>  
         <p>Hello,</p>
         <p>You requested to reset your password. Click the link below to reset your password:</p>
        <a href="${resetLink}" style="color: #007bff; text-decoration: none;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>`,
    };
    await transporter.sendMail(mailOptions);

    await ForgotPasswordRequest.create({
      _id: resetToken,
      isActive: true,
      userId: user._id,
    });

    res.status(201).json({ message: "Email Sent Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email try again" });
    console.log(error);
  }
}

//Reset Password
export async function resetPassword(req, res) {
  const { token, password } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const request = await ForgotPasswordRequest.findOne({_id:token, isActive:true}).session(session);
  if(!request) {
  await session.abortTransaction();
    return res.status(404).json({ message: "Invalid or expired token" });
  }
  const userId = request.userId;
  if(!userId) {
    await session.abortTransaction();
    return res.status(404).json({ message: "User not found" });
  
  }
  const hashedPassword = await hash(password, 10);
  await User.updateOne(
    { _id: userId },
    { $set: { password: hashedPassword } },
    { session });
    
    await ForgotPasswordRequest.updateOne(
      { _id: token },
      { $set: { isActive: false } },
      { session }
    );
    await session.commitTransaction();
    res.status(200).json({ message: "Password Changed successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }finally {
    session.endSession();
  }
}

//Verfication of token
export async function verifyToken(req, res) {
  const token = req.params.token;
  const request = await findOne({ where: { id: token, isActive: true } });
  if (!request) {
    return res.status(404).json({ message: "Invalid or expired token" });
  }
  res.status(200).json({ message: "Token is valid" });
}
