const mongoose = require('mongoose');

const splitBillSchema = new mongoose.Schema({
    title: String,
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    amount: Number,
    splitAmount: Number,
    discription:String
    
});

const SplitBill = mongoose.model('SplitBill', splitBillSchema);

module.exports = SplitBill;