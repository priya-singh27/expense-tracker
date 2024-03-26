const Expense = require('../model/expense');


async function findByIdAndDelete(id) {
    try {
        let expense = await Expense.findByIdAndDelete(id);
        if (!expense) {
            var errObj = {
                code: 400,
                message:'No expense found'
            }
            return [errObj, null];
        }

        return [null, expense];
    }
    catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message:'No expense found'
        }
        return [errObj,null]
    }
}

async function findExpenseByIdAndUpdate(id,title,amount,date,category) {
    try {
        let expense = await Expense.findByIdAndUpdate(
            id,
            { title, amount, date, category },
            {new:true}
        );
        if (!expense) {
            var errObj = {
                code: 400,
                message:'No expense found'
            }
            return [errObj, null];
        }

        await expense.save();
            
        return [null, expense];
    } catch (err) {
        console.log(err);
        var errObj = {
            code: 500,
            message:'Something Went Wrong'
        }
        return [errObj, null];
    }
}

module.exports = {
    findExpenseByIdAndUpdate,
    findByIdAndDelete,
}