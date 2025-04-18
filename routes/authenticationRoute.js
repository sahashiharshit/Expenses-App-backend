const express = require("express");
const { login } = require("../controllers/loginController");
const { signupUser } = require("../controllers/signupController");
// const { resetPassword, forgotPassword, verifyToken } = require("../controllers/passwordChangeController");
const router = express.Router();

router.post("/signup", signupUser);
router.post("/login", login);
// router.post("/forgotpassword",forgotPassword);
// router.post("/reset-password",resetPassword);
// router.get("/verify-token/:token",verifyToken);
module.exports = router;
