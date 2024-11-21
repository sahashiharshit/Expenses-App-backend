const User = require("../models/Users");
const bcrypt = require('bcrypt');

exports.signupUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
  
   const saltRounds= 15;
   const hashedPassword = await bcrypt.hash(password,saltRounds);
    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
    });
    res.status(200).json({data:newUser});
  } catch (error) {
    if(error.name==="SequelizeUniqueConstraintError"){
      res.status(500).json({
        message: "Email id already exist",
        error: error,
      });
    }else{
      res.status(500).json({
        message: "Error in Signing up user.",
        error: error,
      });
    }
   
  }
};
