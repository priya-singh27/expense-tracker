const authMiddleware = require('../middleware/authMiddleware');
const { createSplitBill } = require('../controller/splitbill.controller');
const express = require('express');
const router = express.Router();

router.post('/splitbill', authMiddleware, createSplitBill);

module.exports = router;