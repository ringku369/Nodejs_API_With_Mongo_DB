const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const route = express.Router();
dotenv.config({
  path: '.env'
}); // load env file
const PORT = process.env.PORT || 9000; // load port from env file

//load database connection
const connectionDB = require('./server/database/connection');
connectionDB(); // mongodb load


app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

//app.use(express.json()); // load post file type
app.use(route); // load route


// load auth middleware
const {
  jwtAuth,
  jwtAuthAdmin,
  jwtAuthUser
} = require('./server/middleware/auth');
//load route file
const authRoute = require('./server/route/authRoute');
const userRoute = require('./server/route/userRoute');
const categoryRoute = require('./server/route/categoryRoute');

//load parent route
app.use('/', (req, res) => {
  res.send(`This is project root route`);
});

route.use('/auth', authRoute);
route.use('/category', jwtAuth, categoryRoute);
route.use('/user', userRoute);



//load assets
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));
// load server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})