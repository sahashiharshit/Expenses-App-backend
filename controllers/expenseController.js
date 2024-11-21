const { Sequelize } = require("sequelize");
const Expenses = require("../models/Expenses");
const User = require("../models/Users");
const sequelize = require("../utils/database");

exports.addExpenses = async (req, res) => {
  const { money, expenseName, category } = req.body;
  const userId = req.user.id;
  const t = await sequelize.transaction();
  try {
    const newExpense = await Expenses.create(
      {
        money: money,
        expenseName: expenseName,
        category: category,
        userId: userId,
      },
      {
        transaction: t,
      }
    );
    await User.update(
      {
        totalexpenses: Sequelize.literal(`totalexpenses+${money}`),
      },
      { where: { id: userId }, transaction: t }
    );

    await t.commit();
    res.status(200).json(newExpense);
    } catch (error) {
    await t.rollback();
    res.status(400).json({
      error: error,
      message: "Expense not added",
    });
    console.log(error);
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    // Default values
    const offset = (page - 1) * limit;
  
    const userId = req.user.id;
    const { rows: expenses, count } = await Expenses.findAndCountAll({
      where:{userId:userId},
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
  });
    
    if (expenses) {
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
};

exports.deleteExpense = async (req, res) => {
  const id = req.params.id;
  const money = req.query.money;
  
  const user = req.user;
  const t =await sequelize.transaction();
  
  try { 
  
    await Expenses.destroy({
      where: { id: id, userId: user.id },
    },{
      transaction:t
    });
    await User.update({
      totalexpenses: Sequelize.literal(`totalexpenses-${money}`),
    },
    { where: { id: user.id }},{ transaction: t });
    await t.commit();
    res.status(200).json({ message: "Expense Deleted Successfully" });
  } catch (error) {
    //console.log(error);
    await t.rollback();
    res.status(500).json({ message: "Something went wrong deleting expense" });
  }
};
