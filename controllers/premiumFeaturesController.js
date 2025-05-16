

import Users from "../models/Users.js";
//import { S3 } from "aws-sdk";
//import { create, findAll } from "../models/FileUrls.js";



export async function showLeaderBoard(req, res) {
  try {
    const leaderBoard = await Users.find().sort({ totalexpenses: -1 });
    res.status(200).json(leaderBoard);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch leaderboard." });
  }
}

export async function downloadfile(req, res) {
  const t = await _transaction();
  try {
    const uuid = uuidv4();
    const expenses = await req.user.getExpenses();
    const data = JSON.stringify(expenses);
    const filename = `Expenses${req.user.id}/${new Date()}.txt`;
    const fileUrl = await uploadToS3(data, filename);
    await create(
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
}
async function uploadToS3(data, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_ACCESS_KEY = process.env.IAM_ACCESS_KEY;
  const IAM_SECRET_KEY = process.env.SECRET_ACCESS_KEY;

  const s3bucket = new S3({
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

export async function oldReports(req, res) {
  try {
    const userId = req.user.id;
    const reports = await findAll({ where: { userId: userId } });
    //console.log(reports);
    if (!reports) {
      res.status(404).json({ message: "No files found" });
    }
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json(error);
  }
}
