const router = require("express").Router();
//node file system module
const fs = require('fs');
const path = require('path');
//grab the User model that's exported in passport.js
const {Follower, Comment, Post, User, upload, passport} = require( "../passport.js")



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


// get all posts to display 
router.get("/getallposts", async (req, res) => {
  try {
    const allPosts = await Post.find();
    res.send(allPosts);
  } catch (err) {
    res.send(err);
  }
})



// submit a new post 
router.post("/submitPost", async (req, res) => {
  try {
    //submitting post available only if authenticated
    if (req.isAuthenticated()){
      const newPost = new Post({
          from: req.body.from,
          message: req.body.message,
      });
      const result = newPost.save();
      res.send(result)
      console.log("Post submitted successfully!")
    } else{
      res.status(401).json('Not authenticated!');
    }

  } catch (err) {
      res.send(err);
  }
 
});

//like a post 
router.patch("/likePost", async (req, res) => {
  console.log("clicked")
  try {
    //liking post available only if authenticated
    if (req.isAuthenticated()){
      const likedPost = await Post.findOne({_id: req.body.postID});
      const likingUser = await User.findOne({_id: req.body.likedBy._id});
     
      console.log(likedPost.likedby.findIndex(u=>u._id.toString()===likingUser._id.toString()))
      console.log(likedPost.likedby.findIndex(u=>u._id.toString()===likingUser._id.toString()) > -1)

      //find if post is already liked by the user, if user is already in likedby array
      //find via converting id objects to string because querying with id's doesn't work
      const likingUserIndex = likedPost.likedby.findIndex(u=>u._id.toString()===likingUser._id.toString())

      //post is already liked by the user
      if (likingUserIndex > -1){
        //substract 1 from the like count
        likedPost.likeCount = likedPost.likeCount-1
        //remove the user from likedby array
        likedPost.likedby.splice(likingUserIndex, 1)
      } else{
        likedPost.likeCount = likedPost.likeCount+1
        likedPost.likedby.push(likingUser)
      }

      const result = await likedPost.save();
      console.log("Post liked successfully!")
      res.send(result)
    } else{
      res.status(401).json('Not authenticated!');
    }

  } catch (err) {
      res.send(err);
  }
 
});

// comment on a post 
router.post("/sendCommentonPost", async (req, res) => {
  try {
    //commenting on a post is available only if authenticated
    if (req.isAuthenticated()){

      //find the post that is commented on
      const commentedPost = await Post.findOne({_id: req.body.toPostID});

      const newComment = new Comment({
          from: req.body.from,
          date: req.body.date,
          toPostID: req.body.toPostID,
          comment: req.body.comment,
      });
      //put the comment in the comments array of the post 
      commentedPost.comments.push(newComment)
      //increase the commentCount property by 1
      commentedPost.commentCount += 1;  
      //save the post
      const result = commentedPost.save();
      res.send(result)
      console.log("Comment submitted successfully!")
    } else{
      res.status(401).json('Not authenticated!');
    }

  } catch (err) {
      res.send(err);
  }
 
});




module.exports = router


