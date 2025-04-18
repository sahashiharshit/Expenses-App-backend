const User = require("../models/Users");


exports.signupUser = async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const existingUser = await User.findOne({  email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }
    const newUser = new User({
      username,
      email,
      password,
    });
   const savedUser =  await newUser.save();
  
   console.log("User signed up successfully", savedUser);
    res.status(200).json({
      message: "User signed up successfully",
      data: savedUser,
    });
  } catch (error) {
  console.error("Error during signup:", error);
    if (error.code === 11000 && error.keyPattern?.email) {
      res.status(400).json({ message: "Email already exists", error });
    } 
      res.status(500).json({ message: "Signup failed", error:error.message });
    
  }
};
