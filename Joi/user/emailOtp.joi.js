const joi = require('joi');

module.exports = joi.object().keys({
    email:joi.string().email().required(),
    otp: joi.string().length(6).required(),
 
});