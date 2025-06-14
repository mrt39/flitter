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
    secure: process.env.NODE_ENV === 'production', //set to true in production if served over HTTPS, "false" for development
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // "none" for production, "strict" for development, "lax" for twitter oAuth
  }
};

module.exports = { sessionConfig };