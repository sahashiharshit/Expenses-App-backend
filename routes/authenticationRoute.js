import { Router } from "express";
import { login } from "../controllers/loginController.js";
import { signupUser } from "../controllers/signupController.js";
import { resetPassword, forgotPassword} from "../controllers/passwordChangeController.js";
const router = Router();

router.post("/signup", signupUser);
router.post("/login", login);
router.post("/forgotpassword",forgotPassword);
router.post("/reset-password",resetPassword);
// router.get("/verify-token/:token",verifyToken);
export default router;
