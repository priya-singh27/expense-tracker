const { unauthorizedResponse } = require('../utils/response');
const jwt = require('jsonwebtoken');
const secretKey = process.env.Secret_Key;

const resetTokenMiddleware = (req, res, next) => {
    const resetToken = req.header('reset-token');

    if (!resetToken) {
        return unauthorizedResponse(res, 'Reset token is required');
    }
    try {
        const decoded = jwt.verify(resetToken, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        return unauthorizedResponse(res, 'Invalid authorization token');
    }
}
module.exports = resetTokenMiddleware;