//session configuration for express-session

//storing session in mongodb because storing it in client is unstable for production
//(works fine for development but starts to randomly log people out in production, when deployed to server)
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { mongoDB } = require('./database');
require('dotenv').config();

//create session store
const store = new MongoDBStore({
  uri: mongoDB,
  collection: 'appSessions'
});

//session configuration
const sessionConfig = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  proxy: true, //for production
  store: store, //store to mongodb
  cookie: {
    secure: false, //set to true in production if served over HTTPS, "false" for development
    sameSite: 'strict' // "none" for production, "strict" for development, "Lax" for twitter oAuth
  }
};

module.exports = { sessionConfig };