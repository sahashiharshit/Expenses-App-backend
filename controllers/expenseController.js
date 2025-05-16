
import { default as mongoose } from "mongoose";
import Expense from "../models/Expenses.js";
import User from "../models/Users.js";
import ExpenseCategory from "../models/ExpenseCategories.js";
import MonthlyIncome from "../models/MonthlyIncome.js";

export async function getCategories(req, res) {
try{

const categories = await ExpenseCategory.find().sort({categoryName: 1});
res.status(200).json(categories);
}catch(error) {
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
    const newExpense = new Expense(
      {
        money: amount,
        expenseName: expenseName,
        categoryId: categoryId,
        userId: userId,
      },
     
    );
    await newExpense.save();
    await User.findByIdAndUpdate(userId,
      {
        $inc: { totalexpenses: amount }, // Increment the total expenses by the money spent
      },{new:true}
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

export async function getExpenses(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    // Default values
    const skip = (page - 1) * limit;
  
    const userId = req.user._id;
    const [ expenses, count ] = await Promise.all(
    [
    Expense.find({ userId })
    .populate('categoryId', 'categoryName')
    .sort({ createdAt: -1 }).skip(parseInt(skip)).limit(parseInt(limit)),
    Expense.countDocuments({ userId }),
    ]
    );
    
    if (expenses.length>0) {
      res.json({
        expenses,
        totalExpenses: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
    });
    } else {
      res.status(404).json({
        message: "No records founded",
      });
    }
  } catch (error) {
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
   if(!expense) {
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

  const userId = req.user._id;
  const month = req.query.month || new Date().toISOString().slice(0, 7); 
  const [year,monthIndex] = month.split('-').map(Number);
  const firstDay = new Date(year, monthIndex - 1, 1);
  const lastDay = new Date(year, monthIndex, 0,23,59,59,999); 

try {
  const incomeAgg = await MonthlyIncome.aggregate([
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
      totalIncome: { $sum: "$amount" },
    },
  },]);
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
  
  const expenses = await Expense.find({userId,date:{$gte:firstDay,$lte:lastDay}}).sort({date:-1});
  const income =incomeAgg[0]?.totalIncome || 0;
  const totalExpenses = expenseAgg[0]?.totalExpenses || 0;
  const remaining = income - totalExpenses;
  const percentUsed = income ? ((totalExpenses / income) * 100).toFixed(1) : 0;
  res.json({month, income, totalExpenses, remaining, percentUsed, expenses});
  
  
} catch (error) {
  res.status(500).json({error:'server error'});
}
}

export async function addIncome(req, res) {

const {amount} = req.body;
const userId = req.user._id;
console.log(amount);
 try {
  const monthlyIncome = new MonthlyIncome({
    userId,
    amount,
  });
 await monthlyIncome.save();
  
  res.status(200).json({
    message: "Income added successfully",
    });
 
 }
 catch (error) {
  console.log(error);
  res.status(500).json({
    error: error,
    message: "Error adding income",
  });
  
 }
}
