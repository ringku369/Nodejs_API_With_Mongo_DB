const express = require('express');
const route = express.Router();
const categoryController = require('../controller/categoryController');
const {
    jwtAuth,
    jwtAuthAdmin,
    jwtAuthUser
} = require('../middleware/auth');


// category crud route
route.get('/', categoryController.show);
route.get('/:id', categoryController.one);
route.post('/', categoryController.create);
route.put('/:id', categoryController.update);
route.delete('/:id', categoryController.delete);

// category login route

module.exports = route;