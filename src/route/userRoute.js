const express = require('express');
const route = express.Router();
const userController = require('../controller/userController');
const {
    jwtAuthAdmin,
    jwtAuthUser,
    jwtAuthSuperAdmin
} = require('../middleware/auth');

// user crud route
//route.get('/jwt-test',jwtAuthUser, userController.jwt_test);

route.get('/', userController.show);
route.get('/:id', userController.one);
route.post('/', userController.create);
route.put('/:id', userController.update);
route.delete('/:id', userController.delete);

// user login route
module.exports = route;