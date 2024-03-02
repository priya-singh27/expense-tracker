const { sendOtp,verifyOtp } = require('../controller/user.controller')
const express = require('express');
const router = express.Router();

// router.post('/', createUser);
router.post('/getotp', sendOtp);
router.post('/verifyotp', verifyOtp);


module.exports = router;