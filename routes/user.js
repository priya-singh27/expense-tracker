const createUser = require('../controller/user.controller')
const express = require('express');
const router = express.Router();

router.post('/', createUser);

module.exports = router;