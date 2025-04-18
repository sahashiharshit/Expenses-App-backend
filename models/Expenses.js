const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  money: {
    type: Number,
    required: true,
  },
  expenseName: {
    type: String, // TEXT in SQL usually maps to String in MongoDB
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming expenses are linked to a user
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);

