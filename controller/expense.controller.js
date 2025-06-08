const { findUserById} = require('../repository/user.repository');
const { findExpenseByIdAndUpdate, findByIdAndDelete} = require('../repository/expense.repository');
const { successResponse, serverErrorResponse, badRequestResponse, notFoundResponse, unauthorizedResponse, handle304 } = require('../utils/response');
const joi_schema = require('../Joi/expense/index');
const Expense = require('../model/expense');
const mongoose = require('mongoose');
const User = require('../model/user');

const readExpenses = async (req, res) => {
    try {
        const allExpenses = await Expense.find();
        return successResponse(res, allExpenses, 'All Expenses are being returned successfully');
    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }
}

const addExpense = async (req, res) => {
    try {
        const { error } = joi_schema.createExpense.validate(req.body);
        if (error) {
            return badRequestResponse(res, 'Bad Request');
        }
        const newExpense = new Expense({
            title: req.body.title,
            amount: req.body.amount,
            date: req.body.date,
            category: req.body.category
        });
        
        await newExpense.save();
        return successResponse(res, newExpense, 'Expense added successfully');
    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }
}

const updateExpense = async (req, res) => {
    try {
        const expenseId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return badRequestResponse(res, 'Invalid id provided');
        }
        
        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId,
            {
                title: req.body.title,
                amount: req.body.amount,
                date: req.body.date,
                category: req.body.category
            },
            { new: true } 
        );
        
        if (!updatedExpense) {
            return badRequestResponse(res, 'No expense found');
        }
        
        return successResponse(res, updatedExpense, 'Expense updated successfully');
    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }
}

const deleteExpense = async (req, res) => {
    try {
        const expenseId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return badRequestResponse(res, 'Invalid id provided');
        }

        const deletedExpense = await Expense.findByIdAndDelete(expenseId);
        
        if (!deletedExpense) {
            return badRequestResponse(res, 'No expense found');
        }
        
        return successResponse(res, deletedExpense, 'Expense deleted successfully');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }
}

module.exports = {
    addExpense,
    updateExpense,
    deleteExpense,
    readExpenses,
    // addParticipants
}