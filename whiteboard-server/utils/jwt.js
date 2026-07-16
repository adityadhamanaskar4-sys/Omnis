const jwt = require('jsonwebtoken');
const UserSchema=require('../schemas/UserSchema')
const signInToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};
const validateTokenUser = async (token) => {
    const payload = verifyToken(token);
    if (!payload?.id) {
        throw new Error('Malformed token payload');
    }

    const user = await UserSchema.findById(payload.id).select('_id username email').lean();
    if (!user) {
        throw new Error('Token user no longer exists');
    }

    return {
        id: String(user._id),
        username: user.username,
        email: user.email
    };
};

const verifyAuthToken = async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        // console.log("hlullulu")
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const user = await validateTokenUser(token);
        req.user = user;
        return next();
    } catch (error) {
        res.clearCookie('token', { path: '/' });
        return res.status(401).json({ message: 'Invalid or expired token'+error });
    }
};
module.exports = {verifyAuthToken,signInToken};