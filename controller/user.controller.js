const joi_schema=require('../Joi/user/createUser.joi')
const User = require('../model/user');

const createUser = async (req, res) => {
    const joiValidation = joi_schema.validate(req.body);

    if (joiValidation.error) {
        console.log('Invalid inputs.');
        res.status(400).send(joiValidation.error.details[0].message);
    }

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNum: req.body.phoneNum,
        email: req.body.email,
        password:req.body.password
    });

    res.status(200).send(user);
}

module.exports = createUser;