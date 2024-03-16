const {
    successResponse,
    serverErrorResponse,
    badRequestResponse,
    notFoundResponse,
    handle304
} = require('../utils/response');
const { sendEmail, verifyOTP, generateOtp } = require('../utils/email');
const bcrypt = require('bcrypt');
const joi_schema = require('../Joi/user/index')
const User = require('../model/user');
const findUserUsingEmail  = require('../repository/user.repository');

const resetPassword = async (req, res) => {//After verifying otp through this user can set new password
    try {
        // Validate input
        const { error } = joi_schema.resetPassword.validate(req.body);
        if (error) return badRequestResponse(res,"Invalid data entered");

        // Find the user by email
        const [err, user] = await findUserUsingEmail(req.body.email);
        if (err) {
            return notFoundResponse(res,"No user found");
        }

        if (req.body.newPassword != req.body.confirmPassword) {
            return badRequestResponse(res,"Password doesn't match.");
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        
        // Save the updated user object
        await user.save();

        return successResponse(res,user,"Password updated successfully")
    }
    catch (error) {
        return serverErrorResponse(res, "Internal server error");
    }
};

const forgotPasswordVerify = async (req, res) => {//Verifies the otp entered by user
    try {
        const { error } = joi_schema.otpVerifyJoi.validate(req.body);
        if (error) return badRequestResponse(res, "Invalid data entered");

        const [err, user] = await findUserUsingEmail(req.body.email);
        if (err) return badRequestResponse(res, "User does not exist");

        const isVerified = await verifyOTP(user.otp, req.body.otp);
        if (isVerified) {
            return successResponse(res, "Otp verified successfully.");
        } else {
            return badRequestResponse(res, "Invalid otp entered");
        }
        
    } catch (error) {
        return serverErrorResponse(res, "Sometrhing went wrong");
    }
};


const forgotPassword = async (req, res) => {//Forgot password? Enter email then we'll verify if a user with the given email exist or not if exist you will receive an otp otherwise you'll get bad request response.
    try {
        const { error } = joi_schema.forgotPassword.validate(req.body);
        if (error) return badRequestResponse(res, "Invalid data entered");

        let [err, user] = await findUserUsingEmail(req.body.email);
        if (err) return badRequestResponse(res, "User does not exist");

        const otp = generateOtp();
        
        user.otp = otp;
        user = await user.save();

        await sendEmail(req.body.email, otp);
        
        return successResponse(res, "OTP sent successfully");
    }
    catch (err) {
        return serverErrorResponse(res, "Sometrhing went wrong");
    }
};

const loggingIn = async (req, res) => {//You enter email and password and it finds user with the given email if not exist you'll get badRequest as a response, if its correct entered password will be matched with stored password and if it is correct congrats! you are logged in otherwise you will get badRequest as a response
    try { 
        const { error } = joi_schema.loginVerify.validate(req.body);
        if (error) {
            return badRequestResponse(res,"Invalid data entered");
        }
    
        let [err,user] = await findUserUsingEmail(req.body.email);
        if (err) {
            if (err.code == 400) return badRequestResponse(res, "User not found");
            if (err.code == 500) return serverErrorResponse(res, "Internal server error.");
        }
    
        const isValid = await bcrypt.compare(req.body.password, user.password);
        if (!isValid) return res.status(400).send('Invalid email or password');
    
        const token = user.generateAuthToken();
        user.isActivated = true;
        user = await user.save();
        
        return successResponse(res, token, "Successfully logged in");
    } catch (err) {
        return serverErrorResponse(res,"Something went wrong")
    }
    
}

const verifyOtp = async (req, res) => {//Verifies the otp entered with otp sent 
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
            return badRequestResponse(res,"Invalid data entered");
        }

        const [err,user] = await findUserUsingEmail(req.body.email);

        if (err) {
            if (err.code == 400) return badRequestResponse(res, "User not found");
            if (err.code == 500) return serverErrorResponse(res, "Internal server error.");
        }
        
        const isVerified = await verifyOTP(user.otp, req.body.otp);
        if (isVerified === true) {
            user.isActivated = true;
            user=await user.save();
            
            const token = user.generateAuthToken();

            return successResponse(res,token,"Otp verified successfully");
        } else if(isVerified === false) {
            return res.status(400).send("Either email or otp entered is incorrect");
        }
        
    } catch (err) {

        return serverErrorResponse(res,"Internal server error.");
    }
}

const sendOtp = async (req, res) => {//sends otp on given emailId and saves user's data in DB
 
//search for user in DB
    const [err,user] = await findUserUsingEmail(req.body.email);
    
    if (err) {//If no user
        if (err.code == 404) {//If user not found then create a user
            try {
                const {error} = joi_schema.createUserJoi.validate(req.body);

                if (error) {
                    return badRequestResponse(res,"Invalid data entered");
                }
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
                return successResponse(res,"User saved in database");
            } catch (err) {//If there is some error while creating the user do this 
                console.log(err);
                return serverErrorResponse(res,"Internal server error");
            }
        } else {//If error code is other than 404
            return serverErrorResponse(res,"Internal Server Error: unable to generate OTP");
        }
        
    } else {//If no error => user exist with the given data
        return badRequestResponse(res,"User already registered");
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