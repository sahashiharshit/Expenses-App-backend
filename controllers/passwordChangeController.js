const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const ForgotPasswordRequest = require("../models/ForgotPasswordRequest");
const User = require("../models/Users");
const bcrypt =require('bcrypt');
const sequelize = require("../utils/database");
require("dotenv").config();
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Account doesn't exist" });
    }

   
    const resetToken = uuidv4();

    const resetLink = `http://127.0.0.1:5500/frontend/reset-password.html?token=${resetToken}`;
    
    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
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
        <p>If you did not request this, please ignore this email.</p>`
    
    };
    await transporter.sendMail(mailOptions);
    
    await ForgotPasswordRequest.create({
      id: resetToken,
      isActive: true,
      userId: user.id,
    });

    res.status(201).json({ message: "Email Sent Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email try again" });
    console.log(error);
  }
};


//Reset Password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
    const t = await sequelize.transaction();
    const saltRounds= 15;
    const hashedPassword = await bcrypt.hash(password,saltRounds);
  try {
 
    const response = await ForgotPasswordRequest.findAll({
      where: { id: token },
    });
    if (!response || response.length === 0) {
      return res.status(404).json({ message: 'No forgot password request found' });
  }
    const userId = response[0]?.dataValues?.userId;

    if (!userId) {
      return res.status(404).json({ message: 'No active request found' });
    }
    await User.update(
      { password: hashedPassword },
      {
        where: { id: userId },
      },
      {transaction:t}
    );

    await ForgotPasswordRequest.update(
      {
        isActive: false,
      },
      { where: { id: token } },
      {transaction:t}
    );
    
    await t.commit();
    
    res.status(200).json({message:"Password Changed successfully"});
  } catch (error) {
    
    await t.rollback();
    console.log(error);
    res.status(500).json({message:"Server Error"});
    
  }
};


//Verfication of token
exports.verifyToken =async (req,res)=>{
const token = req.params.token;
const request = await ForgotPasswordRequest.findOne({where:{id:token,isActive:true}});
if (!request) {
  return res.status(404).json({ message: 'Invalid or expired token' });
}
res.status(200).json({ message: 'Token is valid' });
};