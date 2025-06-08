const authMiddleware = require('../middleware/authMiddleware'); 
const { addExpense, updateExpense, deleteExpense, readExpenses } = require('../controller/expense.controller');
const express = require('express');
const router = express.Router();

router.post('/addexpense',addExpense);
router.post('/updateexpense/:id',updateExpense);
router.post('/deleteexpense/:id',deleteExpense);
router.get('/allexpenses', readExpenses);

module.exports = router;