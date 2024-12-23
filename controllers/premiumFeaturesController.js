require("dotenv").config();

const User = require("../models/Users");
const AWS = require("aws-sdk");
const FileUrls = require("../models/FileUrls");
const sequelize = require("../utils/database");
const { Sequelize } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

exports.showLeaderBoard = async (req, res) => {
  try {
    const leaderBoard = await User.findAll({
      attributes: ["id", "email", "totalExpenses"],
      order: [[Sequelize.literal("totalExpenses"), "Desc"]],
    });
    res.status(200).json(leaderBoard);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch leaderboard." });
  }
};

exports.downloadfile = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const uuid = uuidv4();
    const expenses = await req.user.getExpenses();
    const data = JSON.stringify(expenses);
    const filename = `Expenses${req.user.id}/${new Date()}.txt`;
    const fileUrl = await uploadToS3(data, filename);
    await FileUrls.create(
      {
        id: uuid,
        fileUrl: fileUrl.Location,
        userId: req.user.id,
      },
      { transaction: t }
    );

    await t.commit();
    res.status(200).json(fileUrl.Location);
  } catch (error) {
    await t.rollback();
    console.log(error);
  }
};
async function uploadToS3(data, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_ACCESS_KEY = process.env.IAM_ACCESS_KEY;
  const IAM_SECRET_KEY = process.env.SECRET_ACCESS_KEY;

  const s3bucket = new AWS.S3({
    accessKeyId: IAM_ACCESS_KEY,
    secretAccessKey: IAM_SECRET_KEY,
  });
  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };
  try {
    const s3response = await s3bucket.upload(params).promise();

    return s3response; // Returns metadata of the uploaded file
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error; // Propagates the error to the caller
  }
}

exports.oldReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await FileUrls.findAll({ where: { userId: userId } });
    //console.log(reports);
    if (!reports) {
      res.status(404).json({ message: "No files found" });
    }
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json(error);
  }
};
