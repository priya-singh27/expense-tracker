const { sendOtp,verifyOtp,loggingIn,forgotPassword,forgotPasswordVerify,resetPassword } = require('../controller/user.controller')
const express = require('express');
const router = express.Router();

// router.post('/', createUser);
router.post('/sendotp', sendOtp);
router.post('/verifyotp', verifyOtp);
router.post('/login', loggingIn);
router.post('/forgotpassword', forgotPassword);
router.post('/forgotpasswordotp', forgotPasswordVerify);
router.post('/resetpassword', resetPassword);

module.exports = router;