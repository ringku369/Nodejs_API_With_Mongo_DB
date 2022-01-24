const express = require('express');
const route = express.Router();
const userController = require('../controller/userController');
const {jwtAuth, jwtAuthAdmin, jwtAuthUser} = require('../middleware/auth');

// user crud route
route.get('/jwt-test',jwtAuthUser, userController.jwt_test);


route.get('/', (req,res)=>{
    res.send(`This is jwt restiricted root toute`);
});

route.get('/test', (req,res)=>{
    res.send(`This is jwt restiricted test toute`);
});


module.exports = route;