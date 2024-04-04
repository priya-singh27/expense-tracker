const authMiddleware = require('../middleware/authMiddleware');
const { addParticipants,updateSplitBill,addCreatorAsParticipant,addAmount } = require('../controller/splitbill.controller');
const express = require('express');
const router = express.Router();

router.post('/addparticipants', authMiddleware, addParticipants);
router.post('/updatebill/:id', authMiddleware, updateSplitBill);
router.post('/addcreator/:id', authMiddleware, addCreatorAsParticipant);
router.post('/addamount/:id', authMiddleware, addAmount);

module.exports = router;