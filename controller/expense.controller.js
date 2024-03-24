const {  findExpenseByIdAndUpdate ,findByIdAndDelete,findAllExpenses} = require('../repository/expense.repository');
const { successResponse, serverErrorResponse, badRequestResponse, notFoundResponse, unauthorizedResponse, handle304 } = require('../utils/response');
const joi_schema = require('../Joi/expense/index');
const Expense = require('../model/expense');
const mongoose = require('mongoose');

const readExpenses = async (req, res) => {
    try {
        const [err, expenses] = await findAllExpenses();
        if (err) {
            if (err.code == 404) {
                return notFoundResponse(res, 'No expenses');
            }
            if (err.code == 500) {
                return serverErrorResponse(res, 'Something Went Wrong');
            }
        }

        return successResponse(res,expenses,'All Expenses are being returned successfully')

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

        const [err, expense] = await findByIdAndDelete(expenseId);
        if (err) {
            if (err.code == 400) {
                return badRequestResponse(res, 'No expense found');
            }
            if (err.code == 500) {
                return serverErrorResponse(res, 'Something Went Wrong');
            }
        }

        return successResponse(res, expense, 'Expense deleted successfully.');


    } catch (err) {
        console.log(err);
        return serverErrorResponse(res,'Something Went Wrong')
    }
}

const updateExpense = async (req, res) => {
    try {
        const expenseId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return badRequestResponse(res,'Invalid id provided')
        }
        
        const [err, expense] = await findExpenseByIdAndUpdate(expenseId,req.body.title,req.body.amount,req.body.date,req.body.category);
        if (err) {
            if (err.code == 400) {
                return notFoundResponse(res, 'No expense found.');
            }
            if (err.code == 500) {
                return serverErrorResponse(res,'Something Went Wrong')
            }
        }

        return successResponse(res,expense,'Expense updated successfully.')
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
            return badRequestResponse(res, 'Invalid data entered');
        }
        
        //If data entered is correct save in db
        let newExpense = new Expense({
            title: req.body.title,
            amount: req.body.amount,
            date: req.body.date,
            category:req.body.category
        });
        
        newExpense = await newExpense.save();
        return successResponse(res, newExpense, 'Expense saved');
    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }

    
}

module.exports = {
    addExpense,
    updateExpense,
    deleteExpense,
    readExpenses
}