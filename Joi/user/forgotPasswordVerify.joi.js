const joi = require('joi');

module.exports = joi.object().keys({
    email:joi.string().email(),
    otp: joi.string().length(6).required(),
    newPassword: joi.string().min(8).max(25).required(),
    confirmPassword:joi.string().min(8).max(25).required()
});