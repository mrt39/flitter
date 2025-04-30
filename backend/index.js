//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const cors = require("cors");

//import configurations
const { connectToDatabase } = require("./configuration/database");
const { sessionConfig } = require("./configuration/session-config");
const configurePassport = require("./configuration/passport-config");

//import routes
const allRoutes = require("./routes/all-routes");

//initialize app
const app = express();

//configure CORS
app.use(
  cors({
    origin: true,
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    credentials: true,
  })
);

//middleware
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/images', express.static('images')) //serve the files in /images folder as static files

//configure sessions and passport
app.set('trust proxy', 1); //add this for production
app.use(session(sessionConfig));

const passport = configurePassport();
app.use(passport.initialize());
app.use(passport.session());

//connect to database
connectToDatabase();

//use routes
app.use("/", allRoutes);

//error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json("An error occurred");
});

//start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





