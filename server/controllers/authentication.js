import Video from "../models/Videos.js";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';

//Verify Token for middleware and every request/response cycle
const verifyToken = (req, res) => {
    if (!req?.cookies?.kelechi || !req.user) {
        return res.status(200).json({isValid: false, error: "No authorization, expired cookie!"});
    }
    else{
        return res.status(200).json({isValid: true, user:req.user, message:"Token Valid"})
    }
}

//Login authentication controller
const login = async(req, res) => {

    const { email, password } = req.body

    try{
        if (!email || !password) {
            return res.status(400).json({error: "Invalid entries"})
        }
    
        const user = await User.findOne({email});
    
        if (!user) {
            return res.status(400).json({error: "No user available in the database"})
        }
    
        const isValidPassword = user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(400).json({error: "Wrong Password"})
        }
    
        const token = jwt.sign({user}, process.env.JWT_SECRET, {expiresIn: 60000 * 24 * 60});

        const tokenOptions = {
            secure: true,
            httpOnly:true,
            sameSite: 'None',
            path:'/',
            maxAge:60000 * 24 * 60
        }
        res.cookie('kelechi', token, tokenOptions);
    
        res.status(200).json({message: "Login successful", user})
    }
    catch(err){
        console.error("Failed to login", err);
        res.status(500).json({error: "Failed to login"})
    }
}

//Logout authentication controller
const logout = (req, res) => {
    try{
        const options = {
            SameSite: 'None',
            Secure: true,
            maxAge: 0,
            httpOnly: true,
            path: '/'
        }
        res.clearCookie('kelechi', options);
        res.status(200).json({message: "User successfully logged out"})
    }
    catch(err) {
        return res.status(500).json({error: "Server Error. Unable to logout."})
    }
    
}

export {login, verifyToken, logout}