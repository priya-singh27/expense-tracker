const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const secretKey = process.env.secret_Key;

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNum: String,
    email: String,
    password: String
});

userSchema.methods.generateAuthToken = function () {
    //Token is generated using data in payload +secretkey
    const token = jwt.sign({ _id: this._id, email: this.email }, secretKey);
    return token;
} 

const User = mongoose.model('User', userSchema);

module.exports = User;