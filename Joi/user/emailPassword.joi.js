const joi = require('joi');

module.exports = joi.object().keys({
    email: joi.string().email().required(),
    password: joi.string().min(8).max(15).required()
    
});