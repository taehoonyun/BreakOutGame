const jwt = require('jsonwebtoken');
const SECRET = process.env.SERVER_SECRET;
const ADMIN_VERSION = process.env.ADMIN_VERSION;

const sendJSON = (res, status, content) => {
    try {
        res.status(status);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.json(content);
    } catch (e) { }
};

const generateToken = (userId) => {
    return jwt.sign({ userId }, SECRET, { expiresIn: '14d' });
};

const verifyToken = async (req, res, next) => {
    try {
        const token = getToken(req);
        const adminVersion = getAdminVersion(req);
        if (adminVersion && adminVersion !== ADMIN_VERSION) {
            return sendJSON(res, 400, {
                err: 'EDI Monitoring System has been updated! Please reload it!',
            });
        }

        const decoded = await validateToken(token);
        req.userId = decoded.userId;
        return next();
    } catch (err) {
        return sendJSON(res, 401, {
            err: 'Invailed Token, ' + err.message,
        });
    }
};

const validateToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

const getUserId = (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            const decoded = await validateToken(token);
            resolve(decoded.userId);
        } catch (err) {
            reject(err);
        }
    });
};

const getToken = (req) => {
    let ret = undefined;
    try {
        ret = req.header('Authorization')?.substring(7);
    } catch (e) { }
    return ret;
};

const getAdminVersion = (req) => {
    let ret = undefined;
    try {
        ret = req.header('Admin-Version');
    } catch (e) { }
    return ret;
};

const generateLoginToken = (userId) => {
    return {
        token: generateToken(userId),
        exp: new Date().getTime() + 14 * 24 * 60 * 60, // 14 Days = day * hour * min * sec
    };
};

const generateLoginTokenNoExp = (userId) => {
    return {
        token: generateToken(userId),
    };
};

module.exports = {
    generateLoginToken,
    generateLoginTokenNoExp,
    verifyToken,
    validateToken,
    getUserId,
    getToken,
};
