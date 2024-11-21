const express = require('express');
const { addExpenses, getExpenses, deleteExpense } = require('../controllers/expenseController');
const { authenticate } = require('../middleware/authentication');
const { downloadfile } = require('../controllers/premiumFeaturesController');

const router = express.Router();


router.post('/add',authenticate,addExpenses);
router.get('/getExpenses',authenticate,getExpenses);
router.delete('/deleteExpense/:id',authenticate,deleteExpense);



module.exports= router;