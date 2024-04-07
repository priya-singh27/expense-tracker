const authMiddleware = require('../middleware/authMiddleware');
const { addParticipants,updateBill,addCreatorAsParticipant,addAmount } = require('../controller/splitbill.controller');
const express = require('express');
const router = express.Router();

router.post('/addparticipants', authMiddleware, addParticipants);
router.post('/updatebill/:id', authMiddleware, updateBill);
router.post('/addcreator/:id', authMiddleware, addCreatorAsParticipant);
router.post('/addamount/:id', authMiddleware, addAmount);

module.exports = router;