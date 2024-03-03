const { sendOtp,verifyOtp,loggingIn } = require('../controller/user.controller')
const express = require('express');
const router = express.Router();

// router.post('/', createUser);
router.post('/sendotp', sendOtp);
router.post('/verifyotp', verifyOtp);
router.post('/login',loggingIn)

module.exports = router;