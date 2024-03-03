const { sendEmail,verifyOTP,generateOtp } = require('../utils/email');
const bcrypt = require('bcrypt');
const joi_schema = require('../Joi/user/createUser.joi')
const User = require('../model/user');
const findUserUsingEmail  = require('../repository/user.repository');

// let tempUserData = {};

const verifyOtp = async (req, res) => {
    /** Verify OTP:
     * 1. Joi Validation
2. Check for email exist or not , if not give error
3. Compare OTP from user’s input from db
4. If comparison returns valid (True) then make isActivated True 
5. Create Token with required payload
6. Return token
     */
}

const sendOtp = async (req, res) => {
    // if (!req.body.email) {
    //     console.log(req.body);
    //     return res.status(400);
    // }

    const [err,user] = await findUserUsingEmail(req.body.email);
    if (err) {
        if (err.code == 404) {
            try {
                const joiValidation = joi_schema.validate(req.body);

                if (joiValidation.error) {
                    console.log('Invalid inputs.');
                    return res.status(400).send(joiValidation.error.details[0].message);
                }
                // tempUserData = req.body;
                const otp = await generateOtp();
                await sendEmail(req.body.email, otp);
                let user = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phoneNum: req.body.phoneNum,
                    email: req.body.email,
                    password: req.body.password,
                    otp:otp
                });
                const salt = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(user.password, salt);
                user = await user.save();
                res.status(200).send(otp);
            } catch (err) {
                console.log(err);
                res.status(500).send("Internal server error")
            }
        } else {
            res.status(500).send('Internal Server Error: unable to generate OTP');
        }
        
    } else {
        res.status(400).send("User already registered.")
    }
    

}

// const createUser = async (req, res) => {
//     try {
//         const joiValidation = joi_schema.validate(req.body);

//         if (joiValidation.error) {
//             console.log('Invalid inputs.');
//             return res.status(400).send(joiValidation.error.details[0].message);
//         }
//         let user = await User.findOne({ email: req.body.email });
//         if (user) return res.status(400).send("User already exists");

//         user = new User({
//             firstName: req.body.firstName,
//             lastName: req.body.lastName,
//             phoneNum: req.body.phoneNum,
//             email: req.body.email,
//             password: req.body.password,
//         });

//         const salt = await bcrypt.genSalt(12);
//         user.password = await bcrypt.hash(user.password, salt);
//         user = await user.save();

//         const token = user.generateAuthToken();

//         res.header('x-auth-token',token).send(user);
//     } catch (err) {
//         res.status(404);
//         console.log("Something went wrong",err);
//     }
// }


module.exports = {
    // createUser,
    sendOtp,
    verifyOtp
}