const mongoose = require('mongoose');
module.exports = function () {
    mongoose.connect('mongodb+srv://priyabeingdev:O8itmesvWdVP1iKt@expense-tracker.ockqd6w.mongodb.net/expense_tracker')
    .then(() => console.log('Connected to MongoDB Atlas...'))
    .catch(error => console.error('Could not connect to MongoDB...', error));
}