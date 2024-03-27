const authMiddleware = require('../middleware/authMiddleware'); 
const { addExpense, updateExpense, deleteExpense, readExpenses } = require('../controller/expense.controller');
const express = require('express');
const router = express.Router();

router.post('/addexpense', authMiddleware,addExpense);
router.post('/updateexpense/:id', authMiddleware,updateExpense);
router.post('/deleteexpense/:id', authMiddleware,deleteExpense);
router.get('/allexpenses', authMiddleware, readExpenses);
// router.post('/addparticipant', authMiddleware, addParticipants);


module.exports = router;