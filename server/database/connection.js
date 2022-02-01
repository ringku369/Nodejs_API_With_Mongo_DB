const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({});
const URI = process.env.HOST + process.env.DB;
//console.log(URI);
var connectionDB = () => {
    mongoose.connect(URI).then(() => {
        console.log('DB connection success');
    }).catch((err) => {
        console.log(err);
    })
}
module.exports = connectionDB;