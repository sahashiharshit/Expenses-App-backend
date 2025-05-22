import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import FileUrls from "../models/FileUrls.js";
import Expenses from "../models/Expenses.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export async function showLeaderBoard(req, res) {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );
    const leaderBoard = await Expenses.aggregate([
      {
        $match: {
          date: { $gte: firstDay, $lte: lastDay },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$money" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          totalSpent: 1,
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
    ]);

    res.status(200).json(leaderBoard);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch leaderboard." });
  }
}

export async function createFile(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const firstDay = new Date();
    firstDay.setDate(1);
    firstDay.setHours(0, 0, 0, 0);
    const lastDay = new Date(firstDay);
    lastDay.setMonth(firstDay.getMonth() + 1);
    lastDay.setDate(0);
    lastDay.setHours(23, 59, 59, 999);

    const expenses = await Expenses.find({
      userId: req.user._id,
      date: { $gte: firstDay, $lte: lastDay },
    }).session(session)
    .populate("categoryId", "categoryName");
    
  
    let total = 0;
    let summary = `Expense Summary for ${req.user.username} (Month: ${firstDay.toLocaleString("default", {month: "long"})})\n\n`;
    summary += `Date Generated: ${new Date().toLocaleString()}\n\n`;
    summary += "Expenses:\n";
    
    expenses.forEach((expense,index)=>{
     const amount = expense.money.toFixed(2);
     const category = expense.categoryId?.categoryName || "Uncategorized";
    const date = new Date(expense.date).toLocaleDateString();
    const description =expense.expenseName || "No description";
    summary += `${index + 1}.${category} - ${amount}\n Date: ${date}\n Note: ${description}\n\n`;
    total += expense.money;
    }); 
    summary += `Total Expenses this month: ${total.toFixed(2)}\n`;
    
    const filename = `Expenses${req.user._id}/${new Date().toISOString()}.txt`;
    const fileUrl = await uploadToS3(summary, filename);
    if (!fileUrl) {
      return res.status(500).json({ message: "Failed to upload file." });
    }
    const downloadedFile = new FileUrls({
      s3Key: filename,
      userId: req.user._id,
    });
    await downloadedFile.save({ session });
    await session.commitTransaction();
    res.status(200).json(fileUrl.Location);
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong while downloading the file." });
  } finally {
    session.endSession();
  }
}

async function uploadToS3(data, filename) {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.IAM_ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });
  const safeFilename = filename.replace(/[:]/g, "-");
  const params = {
    Bucket: BUCKET_NAME,
    Key: safeFilename,
    Body: data,

    ContentType: "text/plain",
  };
  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: safeFilename,
    });
    const signedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 3600,
    });
    //const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    return { Location: signedUrl };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error; // Propagates the error to the caller
  }
}

export async function oldReports(req, res) {
  try {
    const userId = req.user._id;
    const reports = await FileUrls.find({ userId }).sort({ createdAt: -1 });
    console.log(reports);
    if (!reports || reports.length === 0) {
      res.status(404).json({ message: "No files found" });
    }
    res.status(200).json(reports.map(report => ({
    key:report.s3Key,
    createdAt:report.createdAt,
    })));
  } catch (error) {
    res.status(500).json(error);
  }
}

export async function downloadOldFile(req,res){
  const key  = decodeURIComponent(req.params.key);
  console.log(key);
  
  try{
    const s3Client = new S3Client({
    
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.IAM_ACCESS_KEY,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
  });
    const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    key: key,
    });
    
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    res.status(200).json({ url: signedUrl });
    
  }
  catch (error) {
  console.error("Error downloading file:", error);
  res.status(500).json({ message: "Failed to download file." });
  }

}