const jwt = require('jsonwebtoken');
const { errorResponse } = require('../lib/response');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return errorResponse(res, 'UNAUTHORIZED', 'Access denied. No token provided.', 401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return errorResponse(res, 'FORBIDDEN', 'Access denied. Invalid or expired token.', 403);
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
