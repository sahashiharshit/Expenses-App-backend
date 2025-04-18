const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const mongoose = require("mongoose");

const authentication = require("./routes/authenticationRoute");
 const expenses = require("./routes/expenseRoute");
// const premium = require("./routes/premiumRoute");

const app = express();
// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "access.log"),
//   { flags: "a" }
// );

app.use(express.json());
app.use(cors());

// app.use(morgan("combined", { stream: accessLogStream }));
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/views", express.static(path.join(__dirname, "views")));
app.use("/expense", authentication);
 app.use("/expense", expenses);
// app.use("/purchase", premium);
// app.use("/premium", premium);
// app.use("/password", authentication);

app.get("/", (req, res) => {

  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// app.get("*", (req, res) => {
//   const requestedUrl = req.url;
//   const filePath = requestedUrl.startsWith("views")
//     ? path.join(__dirname, requestedUrl)
//     : path.join(__dirname, "public", requestedUrl);
  
//   res.sendFile(filePath, (err) => {
//     if (err) {
//       console.error("Error serving file:", err.message);
//       res.status(404).send("File not found");
//     }
//   });
// });


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });
// Catch 404 errors
app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).send("Something went wrong");
});