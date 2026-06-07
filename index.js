require('dotenv').config();
const express = require('express');
const app = express();  
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET 


app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
       return res.status(401).json({message:'Unauthorized, Access denied'});
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if(err){
            return res.status(403).json({message:'Access Denied: Invalid Or Expired Token'});  
        }
        req.user = user;
        next();
      })
}

app.post('/api/auth/token',(req,res)=>{
    const {username} = req.body;
    if(!username){
        return res.status(400).json({message:'Username is required'});  
    }
    const userPayload = {username:username};
    const accessToken = jwt.sign(userPayload, JWT_SECRET, {expiresIn:'10m'});
    res.json({accessToken:accessToken}); 
})

app.get('/api/public', (req, res) => {
    res.json({ message: 'Hello! This is a public endpoint. Anyone can see this.' });
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

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})