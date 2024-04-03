const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const secretKey = process.env.Secret_Key;

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNum: String,
    email: String,
    password: String,
    otp: {
        type: String,
        required:true
    },
    isActivated: {
        type: Boolean,
        default:false
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    requestReceived: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    requestSent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    expenses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Expense'
    }],
    splitBills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'SplitBill'
    }]

});

userSchema.methods.generateAuthToken = function () {
    //Token is generated using data in payload +secretkey
    const token = jwt.sign({ _id: this._id}, secretKey);
    return token;
} 

userSchema.methods.generateResetToken = function () {
    //Token is generated using data in payload +secretkey
    const resetToken = jwt.sign({ _id: this._id}, secretKey,{expiresIn:'1h'});
    return resetToken;
} 


const User = mongoose.model('User', userSchema);

module.exports = User;