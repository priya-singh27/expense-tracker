const joi = require('joi');

module.exports = joi.object().keys({
    otp:joi.string().length(6)
});