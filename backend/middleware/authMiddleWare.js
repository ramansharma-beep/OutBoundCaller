const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = async (req, res, next) =>{

    try{
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({
                message: "Token is required",
            });
        }
        const token  = authHeader.split(' ')[1];
        if(!token){
            return res.status(401).json({
                message: "Token is required",
            });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT_SECRET not configured. Please check your .env file.",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch(error){
       return res.status(401).json({
        message: "Authentication failed - Invalid or expired token",
       });
    }
}


module.exports = authenticateToken; 
