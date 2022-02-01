const mongoose = require('mongoose');
const User = require('./userModel');
var schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
const Category = mongoose.model('category', schema);

module.exports = Category;