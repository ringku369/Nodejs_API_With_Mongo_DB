const dotenv = require('dotenv');
const jwt = require("jsonwebtoken");
dotenv.config({});



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


const jwtAuthAdmin = async (req, res, next) => {
    jwtAuth(req, res, () => {
        if (req.user.isAdmin) {
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
    jwtAuth(req, res, () => {
        if (req.user.isAdmin == false) {
            console.log(req.user);
            next();
        } else {
            return res.status(403).json({
                error: "You are unauthorized"
            });
        }
    })
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
    jwtAuth,
    jwtAuthAdmin,
    jwtAuthUser
};