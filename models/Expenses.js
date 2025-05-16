import { Schema, model } from 'mongoose';

const expenseSchema = new Schema({
  money: {
    type: Number,
    required: true,
  },
  expenseName: {
    type: String, 
      
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'ExpenseCategory',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming expenses are linked to a user
    required: true,
  },
  date:{
    type: Date,
    default: Date.now,
  }
});

export default model('Expense', expenseSchema);

