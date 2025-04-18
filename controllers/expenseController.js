
const Expenses = require("../models/Expenses");
const User = require("../models/Users");


exports.addExpenses = async (req, res) => {
  const { money, expenseName, category } = req.body;
  const amount = Number(money);
  const userId = req.user._id;
 
  try {
    const newExpense = new Expenses(
      {
        money: amount,
        expenseName: expenseName,
        category: category,
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
};

exports.getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    // Default values
    const skip = (page - 1) * limit;
  
    const userId = req.user._id;
    const [ expenses, count ] = await Promise.all(
    [
    Expenses.find({ userId }).sort({ createdAt: -1 }).skip(parseInt(skip)).limit(parseInt(limit)),
    Expenses.countDocuments({ userId }),
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
};

exports.deleteExpense = async (req, res) => {
  const id = req.params.id;
  const money = req.query.money;
  console.log(id,money)
  const user = req.user;
  
  
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
