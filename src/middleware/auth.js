const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");
dotenv.config({});

// redis
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });
(async () => { await client.connect();})();
// redis

const USERTYPE = ['User','Admin','SuperAdmin'];

const jwtAuth = async (req, res, next) => {
    const headerToken = req.body.token || req.query.token || req.headers["authorization"] || req.headers["token"];
    if (!headerToken) return res.status(403).json({
        error: "A token is required for authentication"
    });

    let token = await get_token(headerToken);
    try {
        const decoded = jwt.verify(token, process.env.SKEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send({
            error: "Invalid Token"
        });
    }
    return next();
};


const jwtAuthSuperAdmin = async (req, res, next) => {
    jwtAuth(req, res, async () => {
        const getToken = await client.get(req.user.id);
        if(!getToken){
            return res.status(403).json({
                error: "You are unauthorized"
            });
        }

        if (req.user.userType == USERTYPE[2]) {
            console.log(req.user);
            next();
        } else {
            return res.status(403).json({
                error: "You are unauthorized"
            });
        }
    })
};

const jwtAuthAdmin = async (req, res, next) => {
    jwtAuth(req, res, async () => {
        const getToken = await client.get(req.user.id);
        if(!getToken){
            return res.status(403).json({
                error: "You are unauthorized"
            });
        }
        if ((req.user.userType == USERTYPE[2]) || (req.user.userType == USERTYPE[1])) {
            console.log(req.user);
            next();
        } else {
            return res.status(403).json({
                error: "You are unauthorized"
            });
        }
    })
};


const jwtAuthUser = async (req, res, next) => {
    
    jwtAuth(req, res, async () => {
        const getToken = await client.get(req.user.id);
        if(!getToken){
            return res.status(403).json({
                error: "You are unauthorized"
            });
        }

        if ((req.user.userType == USERTYPE[2]) || (req.user.userType == USERTYPE[1]) || (req.user.userType == USERTYPE[0])) {
            console.log(req.user);
            next();
        } else {
            return res.status(403).json({
                error: "You are unauthorized"
            });
        }
    })
};

const tokenCheck = async (req, res, next) => {
    const headerToken = req.body.token || req.query.token || req.headers["authorization"] || req.headers["token"];
    let token = await get_token(headerToken);
    const decoded = jwt.verify(token, process.env.SKEY);
    const _id = decoded.id;
    const getToken = await client.get(_id);

    if (getToken) {
        next();
    } else {
        return res.status(403).json({
            error: "You are unauthorized"
        });
    }
};


var get_token = (headerToken) => {
    let bearerToken = headerToken;
    let token = null;
    if (bearerToken) {
        let indexCount = bearerToken.search(" ");
        if (indexCount > 0) {
            return token = bearerToken.split(" ")[1];
        } else {
            return token = bearerToken;
        }
    } else {
        return token;
    }
}

module.exports = {
    get_token,
    jwtAuthUser,
    jwtAuthAdmin,
    jwtAuthSuperAdmin
    
};