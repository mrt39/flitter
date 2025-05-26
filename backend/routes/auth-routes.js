//authentication routes for login, signup, and OAuth
const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user");
const ShortUniqueId = require('short-unique-id');
//for generating random data (for the purpose of passport.js, random banners for twitter and google users)
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const CLIENT_URL = process.env.CLIENT_URL;

//check if user is authenticated
router.get("/login/success", (req, res) => {
  if (req.isAuthenticated()) {
    //send user data to the frontend
    //no populate needed here because req.user is already the up-to-date single source of truth
    res.json(req.user);
  } else {
    res.status(401).send('User not authenticated');
  }
});

//google auth routes
router.get('/auth/google/', 
  passport.authenticate('google', { scope: ['profile', 'email']}),
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    if (req.isAuthenticated()){
      res.redirect(CLIENT_URL);
    }
    else{
        res.send(JSON.stringify("Google login failed!"))
    }
});

//twitter auth routes
router.get('/auth/twitter',
  passport.authenticate('twitter')
);

router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    if (req.isAuthenticated()){
      res.redirect(CLIENT_URL);
    }
    else{
        res.send(JSON.stringify("Twitter login failed!"))
    }
});

//local signup route
router.post("/signup", function(req, res){
  // Generate a short unique ID
  const { randomUUID } = new ShortUniqueId({ length: 8 });
  const randomShortId= randomUUID();

  User.register({name: req.body.name, email:req.body.email, shortId:randomShortId, banner: faker.image.urlPicsumPhotos({ height: 200, width: 600, blur: 0, grayscale: false }) /* add a random banner to registered user */}, req.body.password, function(err){
    if(err){
        console.log(err);
        //check if this is a duplicate email error
        if (err.name === 'UserExistsError') {
            return res.status(409).json({ error: "Email address is already registered" });
        }
        //handle other errors
        return res.status(400).json({ error: err.message || "Registration failed" });
    } else {
        passport.authenticate("local")(req, res, function(){
          console.log("Successfully signed up!")
          res.send(JSON.stringify("Successfully signed up!")) 
        });
    }
  })
});

//local login route
router.post("/login", function(req, res){
  passport.authenticate("local")(req, res, function(){
    console.log("Successfully logged in!")
    res.send(JSON.stringify("Successfully logged in!"))
  })
});

//demo account login route
router.post("/demo-login", function(req, res, next){
  //use passport to authenticate with hardcoded demo credentials
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Demo authentication failed' });
    }
    
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Session error' });
      }
      console.log("Successfully logged in with demo account!");
      return res.json(user);
    });
  })({ body: { 
    email: process.env.DEMO_EMAIL, 
    password: process.env.DEMO_PASSWORD 
  }}, res, next);
});

//logout route
router.post('/logout', (req, res) => {
  console.log("Logging out user:", req.user);
  if (req.isAuthenticated()) {
    req.logout(function(err) {
      if (err) {
        console.error(err);
        res.status(401).json('Not able to logout');
      }
      console.log("Logged out successfully.");
      res.status(200).json("Logged out successfully.");
    });
  } else {
    res.status(401).json('Not able to logout');
  }
});

module.exports = router;