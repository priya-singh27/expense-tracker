const {
    successResponse,
    serverErrorResponse,
    badRequestResponse,
    notFoundResponse,
    handle304
} = require('../utils/response');
const jwt = require('jsonwebtoken');
const { sendEmail, verifyOTP, generateOtp } = require('../utils/email');
const bcrypt = require('bcrypt');
const joi_schema = require('../Joi/user/index')
const User = require('../model/user');
const { findUserByEmail,findUserById }  = require('../repository/user.repository');



const resetPassword = async (req, res) => {//If user wants to change password
    try {
        const { error } = joi_schema.resetPassword.validate(req.body);
        if (error) {
            return badRequestResponse(res, 'Invalid password entered');
        }

        const userId = req.user._id;

        //Find user by id
        const [err, user] = await findUserById(userId);
        if (err) {
            return notFoundResponse(res, 'User not found');
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        
        // Save the updated user object
        await user.save();


        return successResponse(res,'Password reset successfully');
        

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something went wrong');
    }
};

//Function to generate a reset token
const generateResetToken = async (req, res) => {
    try {
        const userId = req.user._id;

        //Find user by Id
        const [err,user] = await findUserById(userId);
        if (err) {
            return notFoundResponse(res, 'User not found');
        }

        const resetToken = user.generateResetToken();
        res.header('reset-token', resetToken).send('Token for resetting the password is generated successfully');
        // return res.json({ resetToken });

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }
}

const forgotPasswordVerify = async (req, res) => {//Verifies the otp entered by user and allows to change password
    try {
        const { error } = joi_schema.forgotPasswordVerify.validate(req.body);
        if (error) return badRequestResponse(res, "Invalid data entered");



        const [err, user] = await findUserByEmail(req.body.email);
        if (err) return badRequestResponse(res, "User does not exist");

        const isVerified = await verifyOTP(user.otp, req.body.otp);
        if (isVerified) {
            if (req.body.newPassword != req.body.confirmPassword) {
                return badRequestResponse(res,"Password doesn't match.");
            }
    
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.newPassword, salt);
            
            // Save the updated user object
            await user.save();
    
            return successResponse(res, user, "Password updated successfully");
    
        } else {
            return badRequestResponse(res, "Invalid otp entered");
        }
    } catch (error) {
        console.log(error);
        return serverErrorResponse(res, "Sometrhing went wrong");
    }
};


const forgotPassword = async (req, res) => {//Forgot password? Enter email then we'll verify if a user with the given email exist or not if exist you will receive an otp otherwise you'll get bad request response.
    try {
        const { error } = joi_schema.forgotPassword.validate(req.body);
        if (error) return badRequestResponse(res, "Invalid data entered");

        let [err, user] = await findUserByEmail(req.body.email);
        if (err) return badRequestResponse(res, "User does not exist");

        const otp = await generateOtp();
        
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
    
        let [err,user] = await findUserByEmail(req.body.email);
        if (err) {
            if (err.code == 400) {
                return badRequestResponse(res, "User not found");
            }
                
            if (err.code == 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }
    
        const isValid = await bcrypt.compare(req.body.password, user.password);
        if (!isValid) {
            return badRequestResponse(res, 'Invalid Email or Password');
        }
    
        const token = user.generateAuthToken();
        user.isActivated = true;
        user = await user.save();
        res.setHeader('x-auth-token', token);
        return successResponse(res, null, "Successfully logged in");
    } catch (err) {
        return serverErrorResponse(res,"Something went wrong")
    }
    
}

const verifyOtp = async (req, res) => {//Verifies the otp entered with otp sent 
    try {
        const { error } = joi_schema.otpVerifyJoi.validate(req.body);//only otp
        if (error) {
            return badRequestResponse(res,"Invalid otp entered");
        }
        
        const [err, user] = await findUserByEmail(req.body.email);
        console.log("Error: ",err);
        console.log("User promise: ",userPromise);

        if (err) {
            if (err.code === 404){
                return badRequestResponse(res, "User not found");
            }
            if (err.code === 500) {
                return serverErrorResponse(res, "Internal server error.");
            }
        }

        console.log("User", user);
        console.log("Otp from db: ", user.otp);
        console.log("Otp entered: ",req.body.otp);
        
        const isVerified = await verifyOTP(user.otp, req.body.otp);
        if (isVerified === true) {
            user.isActivated = true;
            await user.save();
            
            const token = user.generateAuthToken();

            return successResponse(res,token,"Otp verified successfully");
        } else if(isVerified === false) {
            return res.status(400).send("Either email or otp entered is incorrect");
        }
        
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res,"Internal server error.");
    }
}

const sendOtp = async (req, res) => {//sends otp on given emailId and saves user's data in DB
 
//search for user in DB
    const [err,user] = await findUserByEmail(req.body.email);
    
    if (err) {//If no user
        if (err.code == 404) {//If user not found then create a user
            try {
                const {error} = joi_schema.createUserJoi.validate(req.body);

                if (error) {
                    return badRequestResponse(res,"Invalid data entered");
                }
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
                return successResponse(res,user,"User saved in database");
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
    forgotPasswordVerify,
    generateResetToken,
    resetPassword
}