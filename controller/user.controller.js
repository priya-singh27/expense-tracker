const {
    successResponse,
    serverErrorResponse,
    badRequestResponse,
    notFoundResponse,
    handle304
} = require('../utils/response');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { sendEmail, verifyOTP, generateOtp } = require('../utils/email');
const bcrypt = require('bcrypt');
const joi_schema = require('../Joi/user/index');
const User = require('../model/user');
const { findUserByEmail,findUserById,findByIdAndUpdateRequestReceived,findByIdAndUpdateRequestSent,findAllReceivedFriendReq,findAllSentFriendReq,findIfTheyAreFriends,isRequestSent }  = require('../repository/user.repository');

const rejectRequest = async (req, res) => {
    try {
        const acceptorsId = req.user._id;
        const sendersId = req.params.id;
        if (!sendersId || (!mongoose.Types.ObjectId.isValid(sendersId))) {
            return badRequestResponse(res, 'Bad Request');
        }

        const acceptor = await User.findById(acceptorsId).populate('requestReceived');
        const senderInRequests = acceptor.requestReceived.find(user => user._id.equals(sendersId));

        acceptor.requestReceived.pull(senderInRequests);

        senderInRequests.requestSent.pull(acceptor);

        await acceptor.save();
        await senderInRequests.save();

        return successResponse(res, 'Request rejected.');

    }
    catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }
}

const approveRequest = async (req, res)=>{
    try {
        const acceptorsId = req.user._id;
        const sendersId = req.params.id;
        
        if (!sendersId || (!mongoose.Types.ObjectId.isValid(sendersId))) {
            return badRequestResponse(res, 'Bad Request');
        }
        const acceptor = await User.findById(acceptorsId).populate('requestReceived');

        const senderInRequests= acceptor.requestReceived.find(user => user._id.equals(sendersId));//For each user object in requestReceived it will check user._id.equals(sendersId)      

        
        //remove frien request from requestReceived and add in friends
        acceptor.requestReceived.pull(senderInRequests);
        acceptor.friends.push(senderInRequests);

        //remove frien request from requestReceived and add in friends
        senderInRequests.requestSent.pull(acceptorsId);
        senderInRequests.friends.push(acceptorsId);

        await acceptor.save();
        await senderInRequests.save();

        return successResponse(res, null, 'Friend request approved successfully');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something Went Wrong');
    }
}

const getSentFriendRequests = async (req, res) => {
    try {
        const userid = req.user._id;
        const [err, sentReq] = await findAllSentFriendReq(userid);

        if (!sentReq || sentReq.length === 0) {
            return successResponse(res, [], 'No friend requests sent.');
        }

        return successResponse(res, sentReq, 'List of all sent friend requests.');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something went wrong.');
    }
}

const getReceivedFriendRequests = async (req, res) => {
    try {
        const userid = req.user._id;
        const [err, receivedReq] = await findAllReceivedFriendReq(userid);

        if (!receivedReq || receivedReq.length === 0) {
            return successResponse(res, [], 'No received friend requests found.');
        }

        return successResponse(res, receivedReq, 'List of all received friend requests.');

    } catch (err) {
        console.log(err);
        return serverErrorResponse(res, 'Something went wrong.');
    }
}

const addFriend = async (req, res) => {
    try {
        const authenticatedUserId = req.user._id;
        const [Error, friend] = await findIfTheyAreFriends(authenticatedUserId, req.body._id);
        const [Err, inSentReq] = await isRequestSent(authenticatedUserId, req.body._id);
        
        if (friend || inSentReq) {
            return badRequestResponse(res, 'Bad request');
        }

        if (Error && Err ) {
            const [err, sender] = await findByIdAndUpdateRequestSent(authenticatedUserId, req.body._id);
            const [error, receiver] = await findByIdAndUpdateRequestReceived(req.body._id, authenticatedUserId);

            if (sender && receiver) {
                return successResponse(res, req.body._id, 'Sent the request');
            } 
        }        
    }
    catch(err) {
        console.log(err);
        return serverErrorResponse(res, 'Something went wrong');
    }
}

const searchFriend = async (req,res) => {
    try {
        const { error } = joi_schema.email.validate(req.body);
        if (error) {
            return badRequestResponse(res, 'Invalid password entered');
        }
        const [err, user] = await findUserByEmail(req.body.email);
        if (err) {
            return notFoundResponse(res, 'User not found');
        }

        return successResponse(res, user._id, 'We found the user.');
    } catch (err) {
        console.log(err);
        return serverErrorResponse(res,'Something went wrong.')
   }
}

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
        const { error } = joi_schema.email.validate(req.body);
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
        const { error } = joi_schema.emailPassword.validate(req.body);
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
        const { error } = joi_schema.emailOtpJoi.validate(req.body);//only otp
        if (error) {
            return badRequestResponse(res,"Invalid otp entered");
        }
        
        const [err, user] = await findUserByEmail(req.body.email);

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
            
            return successResponse(res,null,"Otp verified successfully");
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
    sendOtp,
    verifyOtp,
    loggingIn,
    resetPassword,
    forgotPassword,
    forgotPasswordVerify,
    generateResetToken,
    resetPassword,
    searchFriend,
    addFriend,
    getReceivedFriendRequests,
    getSentFriendRequests,
    approveRequest,
    rejectRequest
}