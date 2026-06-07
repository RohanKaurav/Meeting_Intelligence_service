function structuredLogger(req, res, next){
    const startTime = Date.now();

    res.on('finish', ()=>{
        const duration = Date.now() - startTime;
        const logData = {
             timestamp: new Date().toISOString(),
            traceId: req.traceId || res.locals.traceId || 'unknown',
            method: req.method,
            path: req.originalUrl || req.path,
            status: res.statusCode,
            durationMs: duration
        }

        if (req.logError){
            logData.error = req.logError;
        }
        console.log(JSON.stringify(logData));
    })

    next();
}

module.exports = structuredLogger;
    