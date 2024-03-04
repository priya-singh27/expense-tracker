const joi = require('joi');

module.exports = joi.object().keys({
    email: joi.string().email().required(),
    newPassword: joi.string().min(8).max(15).required(),
    confirmPassword:joi.string().min(8).max(15).required()
    
});