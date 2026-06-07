function successResponse(res, data, status = 200){
    return res.status(status).json({
        traceId: res.locals.traceId || 'unknown',
        success: true,
        data: data
    })
}

function errorResponse(res, code,message, status = 500){
    return res.status(status).json({
        traceId: res.locals.traceId || 'unknown',
        success:false,
       error: {
        code: code,
        message: message
       }
    })
}

module.exports = {
    successResponse,
    errorResponse
}