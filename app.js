const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const db = require("./utils/database");

const authentication = require("./routes/authenticationRoute");
const expenses = require("./routes/expenseRoute");
const premium = require("./routes/premiumRoute");

const User = require("./models/Users");
const Expenses = require("./models/Expenses");
const Order = require("./models/Orders");
const ForgotPasswordRequest = require("./models/ForgotPasswordRequest");
const FileUrls = require("./models/FileUrls");

const app = express();
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(express.json());
app.use(cors());
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"], // Allows resources from the same origin
//         styleSrc: ["'self'", "https://cdn.jsdelivr.net"], // Allows styles from self and the CDN
//         scriptSrc: ["'self'", "'unsafe-inline'"], // Example for scripts
//         imgSrc: ["'self'", "data:"], // Allow images from self and inline data URIs
//       },
//     },
//   })
// );
app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", express.static(path.join(__dirname, "views")));
app.use("/expense", authentication);
app.use("/expense", expenses);
app.use("/purchase", premium);
app.use("/premium", premium);
app.use("/password", authentication);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("*", (req, res) => {
  const requestedUrl = req.url;
  const filePath = requestedUrl.startsWith("views")
    ? path.join(__dirname, requestedUrl)
    : path.join(__dirname, "public", requestedUrl);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error serving file:", err.message);
      res.status(404).send("File not found");
    }
  });
});

User.hasMany(Expenses);
Expenses.belongsTo(User);
User.hasMany(Order);
Order.belongsTo(User);
User.hasMany(ForgotPasswordRequest, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
ForgotPasswordRequest.belongsTo(User, {
  foreignKey: "userId",
});
User.hasMany(FileUrls);
FileUrls.belongsTo(User);

db.sync()
  .then(() => {
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
