import { default as mongoose } from "mongoose";
import Expense from "../models/Expenses.js";
import User from "../models/Users.js";
import ExpenseCategory from "../models/ExpenseCategories.js";
import MonthlyIncome from "../models/MonthlyIncome.js";

export async function getCategories(req, res) {
  try {
    const categories = await ExpenseCategory.find().sort({ categoryName: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error,
      message: "Error fetching categories",
    });
  }
}
export async function addExpenses(req, res) {
  const { money, expenseName, categoryId } = req.body;
  const amount = Number(money);
  const userId = req.user._id;
  if (!amount || !expenseName || !categoryId) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }
  try {
    const newExpense = new Expense({
      money: amount,
      expenseName: expenseName,
      categoryId: categoryId,
      userId: userId,
    });
    await newExpense.save();
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { totalexpenses: amount }, // Increment the total expenses by the money spent
      },
      { new: true }
    );

    res.status(200).json(newExpense);
  } catch (error) {
    res.status(400).json({
      error: error,
      message: "Expense not added",
    });
    console.log(error);
  }
}



export async function deleteExpense(req, res) {
  const id = new mongoose.Types.ObjectId(req.params.id);
  const money = req.body.money;
  const user = req.user;
  if (!id) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    const expense = await Expense.findByIdAndDelete(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    await User.findByIdAndUpdate(user._id, {
      $inc: { totalexpenses: -expense.money }, // Decrement the total expenses by the money spent
    });
    res.status(200).json({ message: "Expense Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong deleting expense" });
  }
}

export async function getBudget(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const userId = req.user._id;

  const month = req.params.month;

  const [year, monthIndex] = month.split("-").map(Number);

  const firstDay = new Date(year, monthIndex - 1, 1);

  const lastDay = new Date(year, monthIndex, 0, 23, 59, 59, 999);

  try {
    const monthlyIncomeAgg = await MonthlyIncome.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: firstDay,
            $lte: lastDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlytotalincome: { $sum: "$amount" },
        },
      }
    ]);
    const expenseAgg = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: {
            $gte: firstDay,
            $lte: lastDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$money" },
        },
      },
    ]);
    const totalCount = await Expense.countDocuments({userId,date:{$gte: firstDay, $lte: lastDay}});
    const totalPages = Math.ceil(totalCount / limit);

    const expenses = await Expense.find({
      userId,
      date: { $gte: firstDay, $lte: lastDay },
    })
    .populate("categoryId","categoryName")
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);
    
    const income = monthlyIncomeAgg[0]?.monthlytotalincome || 0;

    const totalExpenses = expenseAgg[0]?.totalExpenses || 0;
    const remaining = income - totalExpenses;
    const percentUsed = income
      ? ((totalExpenses / income) * 100).toFixed(1)
      : 0;
    res.json({
      month,
      income,
      currentPage: page,
      totalPages,
      totalExpenses,
      remaining,
      percentUsed,
      expenses,
    });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
}

export async function addIncome(req, res) {
  const { amount,incomeSource } = req.body;
  const userId = req.user._id;

  try {
    const monthlyIncome = new MonthlyIncome({
      userId,
      incomeSource,
      amount,
    });
    await monthlyIncome.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { monthlytotalincome: amount }, // Increment the total income by the money added
    });
    res.status(200).json({
      message: "Income added successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error,
      message: "Error adding income",
    });
  }
}
