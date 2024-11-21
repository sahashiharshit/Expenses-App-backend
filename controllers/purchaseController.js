const Razorpay = require("razorpay");
const Order = require("../models/Orders");
const User = require("../models/Users");
const sequelize = require("../utils/database");
require("dotenv").config();

exports.purchasepremium = async (req, res) => {
  const t = await sequelize.transaction();
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

    await req.user.createOrder({
      orderid: order.id,
      status: "PENDING",
    },{transaction:t});

    await t.commit();
    return res.status(201).json({
      order,
      key_id: rzp.key_id,
    });
    
    
  } catch (error) {
   await t.rollback();
    console.log(error);
    res
      .status(403)
      .json({ message: "Something went wrong", error: error.message });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { payment_id, order_id } = req.body;
    if (!payment_id || !order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and Order ID are required",
      });
    }

    const order = await Order.findOne({ where: { orderid: order_id } });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    await order.update({
      paymentid: payment_id,
      status: "SUCCESSFUL",
    },{transaction:t});
    await req.user.update({ ispremiumuser: true },{transaction:t});
      await t.commit();
    return res.status(202).json({
      success: true,
      message: "Transaction successful",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating transaction status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating transaction status",
      error: error.message,
    });
  }
};

exports.updateFailedTransactionStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { payment_id, order_id } = req.body;
    if (!payment_id || !order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and Order ID are required",
      });
    }

    const order = await Order.findOne({ where: { orderid: order_id } });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    await order.update({
      paymentid: payment_id,
      status: "FAILED",
    },{transaction:t});
    await req.user.update({ ispremiumuser: false },{transaction:t});
    await t.commit();
    return res.status(202).json({
      success: true,
      message: "Transaction Failed",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error updating transaction status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating transaction status",
      error: error.message,
    });
  }
};

exports.checkPremium = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
   return res.status(201).json({ ispremiumuser: user.ispremiumuser });
  } catch (error) {
    console.log(error);
    res.status(400).json({
    error:error,
    message:"Something went wrong while doing user search"
    });
  }
};
