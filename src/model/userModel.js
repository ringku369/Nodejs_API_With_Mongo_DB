const mongoose = require('mongoose');
var schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        default: 'Male'
    },

    status: {
        type: Boolean,
        default: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        enum : ['User','Admin','SuperAdmin'],
        default: 'User'
    }
}, {
    timestamps: true
});
const User = mongoose.model('user', schema);

module.exports = User;