const { unauthorizedResponse } = require('../utils/response');
const jwt = require('jsonwebtoken');
const secretKey = process.env.secret_Key;

const authMiddleware = (req, res, next) => {
    const authToken = req.header('x-auth-token');

    if (!authToken) {
        return unauthorizedResponse(res, 'Authorization token is required');
    }
    try {
        const decoded = jwt.verify(authToken, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        return unauthorizedResponse(res, 'Invalid authorization token');
    }
}
module.exports = authMiddleware;