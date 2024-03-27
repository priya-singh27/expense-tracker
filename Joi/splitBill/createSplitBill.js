const joi = require('joi');


module.exports = joi.object().keys({
    title: joi.string().required(),
    participants: joi.array().min(1).required(),
    amount: joi.number().required(),
    splitAmount: joi.number().min(1).required(),

    // splitAmount: joi.number().min(1).max(joi.ref('amount')).required(),
    discription:joi.string().required()
    
});