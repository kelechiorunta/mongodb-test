import jwt from 'jsonwebtoken'
import { connectDB } from './db.js';

const authenticateToken = async(req, res, next) => {

    if (!process.env.JWT_SECRET){
        return res.status(401).json({error: "No secret key"})
    }

    if (!req.cookies?.kelechi) {
        // connectDB(process.env.MONGO_URI);
        req.user = null
        return res.redirect('/login');
    }

    jwt.verify(req.cookies.kelechi, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).json({error: "Expired or Invalid Token"});
        }
        const token = decoded.user
        req.user = token;
        // console.log("USER", req.user.email)
        next();
    })
}

export { authenticateToken }