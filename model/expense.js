const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: String,
    amount: String,
    date: {
        type: String,
        default:Date.now
    },
    category: {
        type: String,
        enum:['Food','Transportation','Utilities','Entertainment','Healthcare','vacation']
    }
});

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = Expense;