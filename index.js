require('dotenv').config();
const express = require('express');
const app = express();  
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ;
const cors = require('cors');
const meetingsRouter = require('./routes/meetings');
const actionItemsRouter = require('./routes/actionItems');

const {traceIdMiddleware} = require('./middleware/trace');
const structuredLogger = require('./middleware/logger');
const errorHandler = require('./middleware/error');
const authenticateToken = require('./middleware/auth'); 
const { successResponse, errorResponse } = require('./lib/response');

app.use(cors());
app.use(express.json());
app.use(traceIdMiddleware);
app.use(structuredLogger);

app.post('/api/auth/token', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return errorResponse(res, 'VALIDATION_ERROR', 'Username is required', 400);
    }
    const userPayload = { username };
    const accessToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });
    return successResponse(res, { accessToken });
});


app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message:'success',
        data:req.user,
    })
})

app.get('/health',(req,res)=>{
    res.status(200).json({
        status:'UP',
    })
})
app.use('/api/meetings', meetingsRouter);
app.use('/api/action-items', actionItemsRouter);
app.use(errorHandler);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})