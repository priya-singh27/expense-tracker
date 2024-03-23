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
    Friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    RequestReceived: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    RequestSent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
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