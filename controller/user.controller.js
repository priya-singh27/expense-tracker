const { sendEmail,verifyOTP,generateOtp } = require('../utils/email');
const bcrypt = require('bcrypt');
const joi_schema = require('../Joi/user/index')
const User = require('../model/user');
const findUserUsingEmail  = require('../repository/user.repository');

const resetPassword = async (req, res) => {
    try {
        // Validate input
        const { error } = joi_schema.resetPassword.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // Find the user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("User not found");

        // Verify OTP
        // const isVerified = await verifyOTP(user.otp, req.body.otp);
        // if (!isVerified) return res.status(400).send("Invalid OTP");

        if (req.body.newPassword != req.body.confirmPassword) {
            return res.status(400).send("Password does not match.")
        }
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        
        // Save the updated user object
        await user.save();

        return res.status(200).send("Password updated successfully");
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).send("Internal server error");
    }
};

const forgotPasswordVerify = async (req, res) => {
    try {
        const { error } = joi_schema.otpVerifyJoi.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email:req.body.email });
        if (!user) return res.status(400).send("User does not exist");

        const isVerified = await verifyOTP(user.otp, req.body.otp);
        if (isVerified) {
            return res.status(200).send("Otp verified successfully.");
        } else {
            return res.status(400).send("Invalid otp entered");
        }
        
    } catch (error) {
        console.log("Error verifying otp:", error);
        return res.status(500).send("Sometrhing went wrong");
    }
}


const forgotPassword = async (req, res) => {
    try {
        const { error } = joi_schema.forgotPassword.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email:req.body.email });
        if (!user) return res.status(400).send("User does not exist");

        const otp = generateOtp();
        
        user.otp = otp;
        user =await user.save();

        await sendEmail(req.body.email, otp);


        return res.status(200).send("OTP sent successfully");
    } catch (err) {
        console.log('Error in forgot password:', err);
        return res.status(500).send("Internal server error");
    }


}

const loggingIn = async (req, res) => {
    const { error } = joi_schema.loginVerify.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send("User not found");
    }

    const isValid = await bcrypt.compare(req.body.password, user.password);
    if (!isValid) return res.status(400).send('Invalid email or password');

    const token = user.generateAuthToken();
    user.isActivated = true;
    user = await user.save();


    return res.send(token)
}

const verifyOtp = async (req, res) => {
    /** Verify OTP:
            1. Joi Validation
            2. Check for email exist or not , if not give error
            3. Compare OTP from user’s input from db
            4. If comparison returns valid (True) then make isActivated True 
            5. Create Token with required payload
            6. Return token
    **/

    try {
        const { error } = joi_schema.otpVerifyJoi.validate({
            email: req.body.email,
            otp:req.body.otp
        });
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const arr = await findUserUsingEmail(req.body.email);

        const err = arr[0];
        let user = arr[1];
        if (err && err.code==500) {
            return res.status(500).send("Internal server error.");
        }
        if (err && err.code==404) {
            return res.status(404).send('User is not found.');
        }

     
        const isVerified = await verifyOTP(user.otp, req.body.otp);
        if (isVerified === true) {
            user.isActivated = true;
            user=await user.save();
            
            const token = user.generateAuthToken();

            return res.status(200).send(token);
        } else if(isVerified === false) {
            return res.status(400).send("Either email or otp entered is incorrect")
        }
        
    } catch (err) {
        console.log("Something went wrong",err);

        return res.status(404).send();
    }
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
                const joiValidation = joi_schema.createUserJoi.validate(req.body);

                if (joiValidation.error) {
                    console.log('Invalid inputs.');
                    return res.status(400).send(joiValidation.error.details[0].message);
                }
                // tempUserData = req.body;
                const otp = generateOtp();
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
                return res.status(200).send();
            } catch (err) {
                console.log(err);
                return res.status(500).send("Internal server error")
            }
        } else {
            return res.status(500).send('Internal Server Error: unable to generate OTP');
        }
        
    } else {
        return res.status(400).send("User already registered.")
    }
    

}




module.exports = {
    // createUser,
    sendOtp,
    verifyOtp,
    loggingIn,
    resetPassword,
    forgotPassword,
    forgotPasswordVerify
}