const { findUserById} = require('../repository/user.repository');
const { findExpenseByIdAndUpdate, findByIdAndDelete} = require('../repository/expense.repository');
const { successResponse, serverErrorResponse, badRequestResponse, notFoundResponse, unauthorizedResponse, handle304 } = require('../utils/response');
const joi_schema = require('../Joi/expense/index');
const Expense = require('../model/expense');
const mongoose = require('mongoose');
const User = require('../model/user');



// const addParticipants = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const participantIds = req.body.participants;
        
//         const { error } = joi_schema.createExpense.validate(req.body);
//         if ( error) {
//             return badRequestResponse(res, 'Bad Request');
//         }

//         const participantsArray = [];
//         const user = await User.findById(userId).populate('friends');
       
//         for (const participantId of participantIds) {

//             if (!mongoose.Types.ObjectId.isValid(participantId)) {
//                 return badRequestResponse(res, 'Invalid id provided');
//             }

//             const [err, participant] = await findUserById(participantId);

//             if (err) {
//                 if (err.code == 404) {
//                     return notFoundResponse(res, 'participan not found');
//                 }
//                 if (err.code == 500) {
//                     return serverErrorResponse(res, 'Something went wrong');
//                 }
//             }

//             const userInFriends = user.friends.find(user => user._id.equals(participantId));
            
//             if (!userInFriends) {
//                 return badRequestResponse(res, 'Not in friends');
//             }
            
//             participantsArray.push(participant._id);

//         }
        
//         //If data entered is correct save in db
//         const newExpense = new Expense({
//             title: req.body.title,
//             amount: req.body.amount,
//             date: req.body.date,
//             category: req.body.category,
//             participants:participantsArray
//         });

//         user.expenses.push(newExpense);

//         for (id of participantsArray) {
//             const eachUser = await User.findById(id).populate();
//             eachUser.expenses.push(newExpense);
//             await eachUser.save();
//         }
        
//         await newExpense.save();
//         await user.save();

//         return successResponse(res, newExpense, 'Expense added');

//     }
//     catch (err) {
//         console.log(err);
//         return serverErrorResponse(res, 'Something Went Wrong');
//     }
// }

const readExpenses = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
     
        const user = await User.findById(authenticatedUserId).populate('expenses');
        const allExpenses = user.expenses;

        return successResponse(res,allExpenses,'All Expenses are being returned successfully')

    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }
}

const deleteExpense = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
        const expenseId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return badRequestResponse(res, 'Invalid id provided');
        }

        //It will find an expense from expense collectionand after deleting that will save in db and store deleted expense in expense variable
        const [err, expense] = await findByIdAndDelete(expenseId);
        
        if (err) {
            if (err.code == 400) {
                return badRequestResponse(res, 'No expense found');
            }
            if (err.code == 500) {
                return serverErrorResponse(res, 'Something Went Wrong');
            }
        }
        
        //For each expense id it will populate with expense object
        const user = await User.findById(authenticatedUserId).populate('expenses');

        //Now we have the expense we want to delete so it will be done by this 
        user.expenses.pull(expenseId);

        //Saving in DB
        await user.save();

        return successResponse(res, user, 'Expense deleted successfully.');


    } catch (err) {
        console.log(err);
        return serverErrorResponse(res,'Something Went Wrong')
    }
}

const updateExpense = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
        const expenseId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(expenseId)) {
            return badRequestResponse(res, 'Invalid id provided');
        }
        
        const user = await User.findById(authenticatedUserId).populate('expenses');
        const [err, updatedExpense] = await findExpenseByIdAndUpdate(expenseId,req.body.title,req.body.amount,req.body.date,req.body.category);
        
        if (err) {
            if (err.code == 400) {
                return badRequestResponse(res, 'No expense found');
            }
            if (err.code == 500) {
                return serverErrorResponse(res, 'Something Went Wrong');
            }
        }
        
        const existingExpense = user.expenses.find(exp => exp._id.equals(expenseId));
        
        existingExpense.title = updatedExpense.title;
        existingExpense.amount = updatedExpense.amount;
        existingExpense.date = updatedExpense.date;
        existingExpense.category = updatedExpense.category;

        await user.save();
        return successResponse(res, user, 'Expense updated successfully');
    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }
}

const addExpense = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
        const [err, user] = await findUserById(authenticatedUserId);
        const { error } = joi_schema.createExpense.validate(req.body);
        if (err || error) {
            return badRequestResponse(res, 'Bad Request');
        }
        
        //If data entered is correct save in db
        const newExpense = new Expense({
            title: req.body.title,
            amount: req.body.amount,
            date: req.body.date,
            category:req.body.category
        });
        
        user.expenses.push(newExpense._id);
        
        await newExpense.save();
        await user.save();
        return successResponse(res, user, 'Expense added');
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
    readExpenses,
    // addParticipants
}