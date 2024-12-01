import express from 'express';
import { login, verifyToken, logout } from "../controllers/authentication.js";
import { authenticateToken } from '../middleware.js';

const authRouter = express.Router();

authRouter.get('*', authenticateToken, (req, res, next) => {
    console.log(req.user?.videoId)
    next();
})

authRouter.get('/verify-token', verifyToken);
authRouter.post('/login', login);
authRouter.get('/logout', logout);

export default authRouter;
