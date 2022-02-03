const express = require('express');
const route = express.Router();

const User = require('../model/userModel');
const CryptoJS = require("crypto-js");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config({});

// redis
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });
(async () => { await client.connect();})();
// redis


const {
    get_token,
    jwtAuthAdmin,
    jwtAuthUser,
    jwtAuthSuperAdmin
} = require('../middleware/auth');

// user crud route


route.post('/registration', async (req, res) => {

    if (!req.body) {
        return res.status(400).json([{
            'error': 'Data to cteate can not be empty'
        }]);
    }
    const count = await User.count({
        'email': req.body.email
    });
    try {
        if (count == 0) {

            // Encrypt
            const encPassword = CryptoJS.AES.encrypt(req.body.password, process.env.SKEY).toString();

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: encPassword,
                userType: req.body.userType
            });
            const saveUser = await newUser.save();

            const {
                password,
                ...others
            } = saveUser._doc;
            return res.status(201).json(others);

        } else {
            return res.status(404).json([{
                'error': 'Duplicate entry is not allowed'
            }]);
        }

    } catch (err) {
        return res.status(500).json({
            error: err.message || "Error create user information"
        });
    }
});


route.post('/login', async (req, res) => {

    if (!req.body) {
        return res.status(400).json([{
            'error': 'User data can not be empty'
        }]);
    }

    const checkUser = await User.findOne({
        'email': req.body.email
    }, {
        name: true,
        email: true,
        password: true,
        userType: true
    });
    if (!checkUser) return res.status(404).json([{
        'error': 'email or password does not match'
    }]);
    // Decrypt Password
    const bytes = CryptoJS.AES.decrypt(checkUser.password, process.env.SKEY);
    const dbPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (req.body.password != dbPassword) return res.status(404).json([{
        'error': 'email or password does not match'
    }]);

    const accessToken = jwt.sign({
            id: checkUser._id,
            userType: checkUser.userType
        },
        process.env.SKEY, {
            expiresIn: '365d'
        }
    );
    const setToken = await client.SETEX(checkUser._id,60,accessToken);
    const {
        password,
        ...others
    } = checkUser._doc;
    return res.status(200).json({
        ...others,
        accessToken
    });
});


route.post('/logout', jwtAuthSuperAdmin, async (req, res, next) => {
    const headerToken = req.body.token || req.query.token || req.headers["authorization"] || req.headers["token"];
    let token = await get_token(headerToken);
    const decoded = jwt.verify(token, process.env.SKEY);
    const _id = decoded.id;
    const delToken = await client.del(_id);

    return res.status(200).json({
        'success': 'Logout successfully done!'
    });
});

module.exports = route;