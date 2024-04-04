const joi = require('joi');

module.exports = joi.object().keys({
    amount:joi.number().positive().required()

   
    // amount:joi.number().max(joi.ref('$..totalAmount')).positive().required()
   

    // splitAmount: joi.number().min(1).max(joi.ref('amount')).required(),
    
});