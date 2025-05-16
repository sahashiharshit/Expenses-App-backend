import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { connect } from "mongoose";

import authentication from "./routes/authenticationRoute.js";
import expenses from "./routes/expenseRoute.js";
import premium from "./routes/premiumRoute.js";

import { fileURLToPath } from "url";

dotenv.config({ path: "./.env"});
const app = express();
const _filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(_filename);

app.use(express.json());
app.use(cors());

// app.use(morgan("combined", { stream: accessLogStream }));
app.use( express.static(path.join(__dirname, "public")));
app.use("/views", express.static(path.join(__dirname, "views")));
app.use("/expense", authentication);
app.use("/expense", expenses);
app.use("/purchase", premium);
app.use("/premium", premium);
// app.use("/password", authentication);

app.get("/", (req, res) => {

  res.sendFile(path.join(__dirname, "views", "index.html"));
});




connect(process.env.MONGODB_URI)
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