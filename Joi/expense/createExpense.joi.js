const joi = require('joi');

module.exports = joi.object().keys({
    title: joi.string().required(),
    amount: joi.number().required(),
    date: joi.string().required(),// "YYYY-MM-DD", "MM/DD/YYYY", "DD/MM/YYYY",including JavaScript Date objects eg:new Date("2023-12-31"): JavaScript Date object representing December 31, 2023.
    category: joi.required(),
    participants:joi.array()
});