const joi = require('joi');


module.exports = joi.object().keys({
    title: joi.string().required(),
    participants: joi.array().min(1).items(
        joi.object({
            participant: joi.string().required(),
            amount:joi.number().default(0)
        })
    ).required(),
    totalAmount: joi.number().required(),
    leftOutAmount:joi.number(),
    splitBillMethodology: joi.string().required()

    // splitAmount: joi.number().min(1).max(joi.ref('amount')).required(),
    
});