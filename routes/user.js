const { sendOtp,verifyOtp,loggingIn,forgotPassword,forgotPasswordVerify,resetPassword, generateResetToken,searchFriend,addFriend } = require('../controller/user.controller')
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const resetTokenMiddleware = require('../middleware/resetTokenMiddleware');


// router.post('/', createUser);
router.post('/sendotp', sendOtp);
router.post('/verifyotp', verifyOtp);
router.post('/login', loggingIn);
router.post('/forgotpassword', forgotPassword);
router.post('/changepassword', forgotPasswordVerify);
router.post('/resetpassword', authMiddleware, generateResetToken);
router.post('/newpassword', resetTokenMiddleware, resetPassword);
router.post('/searchuser', authMiddleware, searchFriend);
router.post('/addfriend', authMiddleware,addFriend);

module.exports = router;