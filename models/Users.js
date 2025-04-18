const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
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
    totalexpenses: {
      type: Number,
      default: 0,
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
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully.");
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});
module.exports = mongoose.model("User", userSchema);
