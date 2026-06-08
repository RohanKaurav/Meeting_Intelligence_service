const { errorResponse } = require('../lib/response');

function errorHandler(err, req, res, next){
    req.logError = {
        message: err.message,
        code: err.code || 'INTERNAL_SERVER_ERROR',
        stack: process.env.NODE_ENV === 'production' ? err.stack : undefined
    }
    if(res.headersSent){
        return next(err);
    }

    let status = err.status || 500;
    let code = err.code || 'INTERNAL_SERVER_ERROR';
    let message = err.message || 'An unexpected error occured';

    if(err.name === 'ZodError'){
        status = 400;
        code = 'VALIDATION_ERROR';
        message = err.errors.map(e=> `${e.path.join('.')}: ${e.message}`).join(', ');
    }

    return errorResponse(res, code, message, status);



}

module.exports = errorHandler;