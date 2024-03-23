const joi = require('joi');

module.exports = joi.object().keys({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    phoneNum: joi.string().min(10).max(13).required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).max(15).required(),
    otp:joi.string()
});

