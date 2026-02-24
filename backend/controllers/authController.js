const pool = require('../config/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const login = async (req, res) =>   {

    try{
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
   
        const [rows] = await pool.execute('SELECT id, email, password, name FROM users WHERE email = ?',[email]);

        if(rows.length === 0) {
            return res.status(401).json({
                message: "User with email does not exist",
            })
        }     
    
        const isPasswordValid = await bcrypt.compare(password, rows[0].password);

        if(!isPasswordValid){
            return res.status(401).json({
                message: "Invalid credentials",
            })
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT_SECRET not configured. Please check your .env file.",
            });
        }

        const token  = jwt.sign({userId: rows[0].id , email: rows[0].email}, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                userId: rows[0].id,
                name: rows[0].name,
                email: rows[0].email,
            }
         });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}


const signup = async (req, res) =>{
    try{

        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }

        // Basic password validation (minimum 6 characters)
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

        if(rows.length > 0){
            return res.status(409).json({
                message: "User with email already exists",
            });
         }

         const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute('INSERT INTO users (name, email ,password)  VALUES (?, ?, ?)', [name, email, hashedPassword]);

         return res.status(201).json({
            success: true,
            message: "User created successfully",
            user:{
                userId: result.insertId,
                name,
                email,}
             });

         }
    catch(error){

        console.log(error);
        return res.status(500).json({
            message: "failed to create user",
            error: error.message,
        });
    }
}

module.exports ={
    login, 
    signup,
}