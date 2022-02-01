const express = require('express');
const route = express.Router();

const User = require('../model/userModel');
const CryptoJS = require("crypto-js");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config({});

const {
    jwtAuth,
    jwtAuthAdmin,
    jwtAuthUser
} = require('../middleware/auth');

// user crud route

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
        isAdmin: true
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
            isAdmin: checkUser.isAdmin
        },
        process.env.SKEY, {
            expiresIn: '365d'
        }
    );


    const {
        password,
        ...others
    } = checkUser._doc;
    return res.status(200).json({
        ...others,
        accessToken
    });
});


route.post('/logout', jwtAuth, (req, res) => {
    return res.status(200).json({
        'success': 'This process has been done successfully!'
    });
});




module.exports = route;