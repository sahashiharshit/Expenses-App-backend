import { Schema, model } from "mongoose";
import { genSalt, hash } from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      
    },
    password: {
      type: String,
      required: true,
    },
    ispremiumuser: {
      type: Boolean,
      default: false,
      required: false,
    },
   
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.pre("save", async function (next) {
console.log("Pre-save hook triggered for password hashing.");
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    console.log("Password hashed successfully.");
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});
export default model("User", userSchema);
