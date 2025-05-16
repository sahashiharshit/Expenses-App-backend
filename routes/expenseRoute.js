import { Router } from 'express';
import { addExpenses, getExpenses, deleteExpense, getCategories, getBudget, addIncome } from '../controllers/expenseController.js';
import { authenticate } from '../middleware/authentication.js';


const router = Router();

router.get('/getCategories',getCategories);
router.post('/add',authenticate,addExpenses);
router.get('/getExpenses',authenticate,getExpenses);
router.post('/deleteExpense/:id',authenticate,deleteExpense);
router.get('/getBudget',authenticate,getBudget);
router.post('/income/add',authenticate,addIncome);


export default router;