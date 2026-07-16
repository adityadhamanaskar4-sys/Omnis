const router = require('express').Router();
const UserSchema = require('../schemas/UserSchema');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('../utils/jwt');

router.use(cookieParser());

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
};

// const validateTokenUser = async (token) => {
//     const payload = jwt.verifyToken(token);

//     if (!payload?.id) {
//         throw new Error('Malformed token payload');
//     }

//     const user = await UserSchema.findById(payload.id).select('_id username email').lean();

//     if (!user) {
//         throw new Error('Token user no longer exists');
//     }

//     return {
//         id: String(user._id),
//         username: user.username,
//         email: user.email
//     };
// };

// const verifyAuthToken = async (req, res, next) => {
//     const token = req.cookies?.token;

//     if (!token) {
//         return res.status(401).json({ message: 'Authentication required' });
//     }

//     try {
//         const user = await validateTokenUser(token);
//         req.user = user;
//         return next();
//     } catch (error) {
//         res.clearCookie('token', { path: '/' });
//         return res.status(401).json({ message: 'Invalid or expired token' });
//     }
// };

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedUsername = username?.trim();

        if (!normalizedUsername || !normalizedEmail || !password?.trim()) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }

        const existingUser = await UserSchema.findOne({ email: normalizedEmail }).lean();
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const user = new UserSchema({
            username: normalizedUsername,
            email: normalizedEmail,
            password: await bcrypt.hash(password, 10)
        });
        await user.save();
        return res.status(201).json({ message: 'User created successfully' });
    } catch (e) {
        return res.status(500).json({ message: 'Error creating user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password?.trim()) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const result = await UserSchema.findOne({ email: normalizedEmail });
        if (!result) {
            return res.status(401).json({ message: 'Email or password incorrect' });
        }
        if (!(await bcrypt.compare(password, result.password))) {
            return res.status(401).json({ message: 'Email or password incorrect' });
        }
        const token = jwt.signInToken({ id: result._id, email: result.email, username: result.username });
        res.cookie('token', token, cookieOptions);
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: result._id,
                username: result.username,
                email: result.email
            }
        });
    } catch (e) {
        return res.status(500).json({ message: 'Error logging user' });
    }
});

router.get('/verify', jwt.verifyAuthToken, (req, res) => {
    return res.status(200).json({
        message: 'Token valid',
        user: req.user
    });
});

router.get('/session', jwt.verifyAuthToken, (req, res) => {
    return res.status(200).json({
        message: 'Active session',
        user: req.user
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });

    return res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
