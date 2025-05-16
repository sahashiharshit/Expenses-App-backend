import Razorpay from "razorpay";
import Order from "../models/Orders.js";
import mongoose from "mongoose";
import User from "../models/Users.js";
export async function purchasepremium(req, res) {
 
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const amount = 1000;

    const order = await rzp.orders.create({ amount, currency: "INR" });
    if (!order) {
      return res
        .status(500)
        .json({ message: "Failed to create Razorpay order" });
    }

    await Order.create({
      orderid: order.id,
      status: "PENDING",
      userId: req.user._id,
    });

    return res.status(201).json({
      order,
      key_id: rzp.key_id,
    });
    
    
  } catch (error) {
    res
      .status(403)
      .json({ message: "Something went wrong", error: error.message });
  }
}

export async function updateTransactionStatus(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { payment_id, order_id } = req.body;
    if (!payment_id || !order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and Order ID are required",
      });
    }

    const order = await Order.findOne( { orderid: order_id }).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    order.paymentid = payment_id;
    order.status = "SUCCESSFUL";
    await order.save({ session });
    const user = await User.findById(req.user._id).session(session);
    if(user){
    user.ispremiumuser = true;
    await user.save({ session });
    }
    await session.commitTransaction();
    session.endSession();
    return res.status(202).json({
      success: true,
      message: "Transaction successful",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
   
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating transaction status",
      error: error.message,
    });
  }
}

export async function updateFailedTransactionStatus(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { payment_id, order_id } = req.body;
    if (!payment_id || !order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and Order ID are required",
      });
    }

    const order = await Order.findOne( { orderid: order_id } ).session(session);
    if (!order) {
    await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
   order.paymentid = payment_id;
   order.status = "FAILED";
   await order.save({ session });
   const user = await User.findById(req.user._id).session(session);
   if(user){
   user.ispremiumuser = false;
   await user.save({ session });
   }
   await session.commitTransaction();
    session.endSession();
    return res.status(202).json({
    
    success: true,
    message: "Transaction failed",
    });
  } catch (error) {
  await session.abortTransaction();
  session.endSession();
    console.error("Error updating transaction status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating transaction status",
      error: error.message,
    });
  }
}

export async function checkPremium(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findOne( { _id: userId } );
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    if (user.ispremiumuser) {
      return res.status(200).json({ ispremiumuser: user.ispremiumuser });
    }
   } catch (error) {
    res.status(400).json({
    error:error,
    message:"Something went wrong while doing user search"
    });
  }
}
