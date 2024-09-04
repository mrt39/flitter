const router = require("express").Router();
//node file system module
const fs = require('fs');
const path = require('path');
//grab the User model that's exported in passport.js
const {Follower, Like, Comment, Post, User, upload, passport} = require( "../passport.js")



const CLIENT_URL = process.env.CLIENT_URL;

router.get("/", (req, res) => {
  res.send("App is Working");
});

router.get("/login/success", (req, res) => {
  if (req.isAuthenticated()) {
    //Send user to the frontend
    res.json(req.user);
  } else {
    res.status(401).send('User not authenticated');
  }
});

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

router.post("/signup", function(req, res){
  User.register({name: req.body.name, email:req.body.email}, req.body.password, function(err){
    if(err){
        console.log(err);
        res.send(JSON.stringify(err))
    } else {
        passport.authenticate("local")(req, res, function(){
          console.log("Successfully signed up!")
          res.send(JSON.stringify("Successfully signed up!")) 
        });
    }
  })
});

router.post("/login", function(req, res){
  passport.authenticate("local")(req, res, function(){
    console.log("Successfully logged in!")
    res.send(JSON.stringify("Successfully logged in!"))
  })
});

router.post('/logout',  (req, res) => {
  console.log("Logging out user:", req.user);
  if (req.isAuthenticated()) {
    req.logout(function(err) {
      if (err) {
        console.error(err);
        res.status(401).json( 'Not able to logout' );
      }
      console.log("Logged out successfully.");
      res.status(200).json( "Logged out successfully." );
    });
} else {
    res.status(401).json( 'Not able to logout' );
}
});




module.exports = router


