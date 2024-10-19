const router = require("express").Router();
//node file system module
const fs = require('fs');
const path = require('path');
// for generating random short ID for users 
const ShortUniqueId = require('short-unique-id');
//grab the User model that's exported in passport.js
const {Follower, Comment, Post, User, upload, passport} = require( "../passport.js")
//for generating random data (for the purpose of routes.js, random banners for signed up users that sign up through the app)
const { faker } = require( '@faker-js/faker');



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
  // Generate a short unique ID
  const { randomUUID } = new ShortUniqueId({ length: 8 });
  const randomShortId= randomUUID();

  User.register({name: req.body.name, email:req.body.email, shortId:randomShortId, banner: faker.image.urlPicsumPhotos({ height: 200, width: 600, blur: 0, grayscale: false }) /* add a random banner to registered user */}, req.body.password, function(err){
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


// get all posts to display 
router.get("/getsingularpost/:postid", async (req, res) => {
    const postID = req.params.postid // access URL variable
  try {
    const singularPost = await Post.findOne({_id: postID});
    res.send(singularPost);
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
          date: req.body.date,
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
  try {
    //liking post available only if authenticated
    if (req.isAuthenticated()){
      const likedPost = await Post.findOne({_id: req.body.postID});
      const likingUser = await User.findOne({_id: req.body.likedBy._id});
     
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


//Edit user profile
router.patch("/editprofile/:userid", async (req, res) => {
  
  const userid = req.params.userid // access URL variable
  const user = await User.findOne({_id: userid});
  const newName = req.body.name
  const newEmail = req.body.email
  const bio = req.body.bio

  console.log(req.body.name + " is the new name for this user: " + user.name)
  try {
    user.name= newName
    user.email= newEmail
    user.bio= bio
   
    await user.save();
    
    //update all Post model instances where "from" field has this user
    await Post.updateMany({from: {$elemMatch: {_id: userid}}}, 
      {
        $set: {
            "from.$.name": newName,
            "from.$.email": newEmail,
            "from.$.bio": bio,
         }
      }
    );
    //update all Post model instances where "comments" field has this user
    const postsWithUserComments = await Post.find({
      "comments.from._id": userid
    });

    postsWithUserComments.forEach(async (post) => {
      post.comments.forEach(comment => {
        comment.from.forEach(user => {
          if (user._id.toString() === userid.toString()) {
            // Update the fields
            user.name = newName;
            user.email = newEmail;
            user.bio = bio;
          }
        });
      });
      await post.save();
    });


    //update all Follower model instances where "user" field, "following" field or "followed" field has this user
    const updateFollowers = await Follower.updateMany(
      {
        $or: [ // $or condition allows the query to look in all three arrays (user, following, followedby).
          { "user._id": userid },
          { "following._id": userid },
          { "followedby._id": userid }
        ]
      },
      {
        $set: {
          "user.$[elem].name": newName,
          "user.$[elem].email": newEmail,
          "user.$[elem].bio": bio,
          "following.$[elem].name": newName,
          "following.$[elem].email": newEmail,
          "following.$[elem].bio": bio,
          "followedby.$[elem].name": newName,
          "followedby.$[elem].email": newEmail,
          "followedby.$[elem].bio": bio
        }
      },
      {
        arrayFilters: [{ "elem._id": userid }] // Update only the elements that match the user id
      }
    );



    res.send(updateFollowers)

} catch (err) {
    res.send(err);
}

});

//get a user's info based on their id
router.get("/getallusers", async (req, res) => {

  try {
    const allUsers = await User.find();
    res.send(allUsers);

  } catch (err) {
    res.send(err);
  }
})

//get a user's info based on their id
router.get("/profile/:userid", async (req, res) => {

  const userID = req.params.userid // access URL variable

  try {
    const user = await User.find({_id: userID});
    res.send(user);

  } catch (err) {
    res.send(err);
  }
})

//get a user's info based on their short id
router.get("/profile-shortId/:shortId", async (req, res) => {

  const shortId = req.params.shortId // access URL variable

  try {
    const user = await User.find({shortId: shortId});
    res.send(user);

  } catch (err) {
    res.send(err);
  }
})



// follow and unfollow a user 
router.post("/followUser", async (req, res) => {
  try {
    //only available if authenticated
    if (req.isAuthenticated()){
      //find the user that clicked on follow and the one that's being followed
      const fromUser = await User.findOne({_id: req.body.fromUser._id});
      const toUser = await User.findOne({_id: req.body.toUser._id});

      //if already followed, unfollow
      if(fromUser.followingtheseID.includes(toUser._id)){
        //decrease the followingCount property of the user that clicked on follow by 1
        fromUser.followingCount -= 1;  
        //find index via converting id objects to string because querying with id's doesn't work
        const likingUserIndex = fromUser.followingtheseID.findIndex(u=>u.toString()===toUser._id.toString())
        //remove it from the likingUserIndex array.
        fromUser.followingtheseID.splice(likingUserIndex, 1)
        //save the user that clicked on follow
        await fromUser.save();

        //decrease the followerCount property of the user that clicked on follow by 1
        toUser.followerCount -= 1;  
        //find index via converting id objects to string because querying with id's doesn't work
        const likedUserIndex = toUser.followedbytheseID.findIndex(u=>u.toString()===fromUser._id.toString())
        //remove it from the likingUserIndex array.
        toUser.followedbytheseID.splice(likedUserIndex, 1)
        //save the user that clicked on follow
        await toUser.save();
      //if not following, follow
      }else { 
        //increase the followingCount property of the user that clicked on follow by 1
        fromUser.followingCount += 1;  
        //push the id of the followed user to the followingtheseID property of the user that clicked on follow
        await fromUser.followingtheseID.push(toUser._id)
        //save the user that clicked on follow
        await fromUser.save();

        //increase the followerCount property of the followed user 
        toUser.followerCount += 1;  
        //push the id of user that clicked on follow to the followedbytheseID property of the followed user
        await toUser.followedbytheseID.push(fromUser._id)
        //save the followed user
        await toUser.save();
      }

      /* ------------------------HANDLING THE Follower MODEL in db----------------------- */

      //get the current user and followed user in the Follower model,
      const fromUserFollowerModel = await Follower.findOne({user: {$elemMatch: {_id: req.body.fromUser._id}}})
      const toUserFollowerModel = await Follower.findOne({user: {$elemMatch: {_id: req.body.toUser._id}}})

      //if the current user exists in the follower model, update
      if(fromUserFollowerModel)
      {
          //find if user is already followed by the user, if user is already in following array
          //find via converting id objects to string because querying with id's doesn't work
          const fromUserIndex = fromUserFollowerModel.following.findIndex(u=>u._id.toString()===toUser._id.toString())

          //already following this user, unfollow 
          if (fromUserIndex > -1){
            fromUserFollowerModel.following.splice(fromUserIndex, 1)
            //save the user that clicked on follow
            await fromUserFollowerModel.save();
          }else {
            await fromUserFollowerModel.following.push(toUser) 
            await fromUserFollowerModel.save()
          }
      } else { //if the user does not exist, create it
        const newFollower = new Follower({
          user: fromUser,
          following: toUser,
        });
        await newFollower.save();
      }

      //if the followed user exists in the follower model, update
      if(toUserFollowerModel)
      {
          //find if user is already followed by the user, if user is already in followedby array
          //find via converting id objects to string because querying with id's doesn't work
          const toUserIndex = toUserFollowerModel.followedby.findIndex(u=>u._id.toString()===fromUser._id.toString())
          //already followed by this user, unfollow 
          if (toUserIndex > -1){
            toUserFollowerModel.followedby.splice(toUserIndex, 1)
            //save the followed user
            await toUserFollowerModel.save();
          }else {
            await toUserFollowerModel.followedby.push(fromUser) 
            await toUserFollowerModel.save()
          }
      } else { //if the followed user does not exist, create it
        const newFollower = new Follower({
          user: toUser,
          followedby: fromUser,
        });
        await newFollower.save();
      }

      console.log("Handled follow/unfollow successfully!")
      //send a success response with a message and status code, at the end of the operation
      res.status(200).json({
        message: "Follow/unfollow operation completed successfully"
      });      
    } else{
      res.status(401).json('Not authenticated!');
    }

  } catch (err) {
      res.status(500).json({ message: "An error occurred", error: err.message });
  }
 
});


//get the follower info of user based on their  short id
router.get("/followers/:shortid", async (req, res) => {

  const shortId = req.params.shortid // access URL variable

  try {
    const followerData = await Follower.find({user: {$elemMatch: {shortId: shortId}}});
    res.send(followerData);

  } catch (err) {
    res.send(err);
  }
})

//populate route for populating the db
//using faker app: https://fakerjs.dev/api/
router.get("/populate", async (req, res) => {

  var quotes = []
  var quoteIndex = 0

  try {
    //get the quotes data into quotes array
    await fetch("https://gist.githubusercontent.com/camperbot/5a022b72e96c4c9585c32bf6a75f62d9/raw/e3c6895ce42069f0ee7e991229064f167fe8ccdc/quotes.json", {
      method: 'GET',
      })
      .then(response => {
          if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          quotes = data.quotes
      })
      .catch(error => {
          console.error('Error:', error);
      });
  
    //create 20 users with 5 posts each
    for (let i=0; i<20; i++){
      // Generate a short unique ID
      const { randomUUID } = new ShortUniqueId({ length: 8 });
      const randomShortId= randomUUID();

      const newUser = new User({
        shortId: randomShortId,
        name: faker.person.fullName(),
        bio: faker.person.bio(),
        uploadedpic: faker.image.urlLoremFlickr({ height: 128, width: 128, category: 'humans' }),
        banner: faker.image.urlPicsumPhotos({ height: 200, width: 600, blur: 0, grayscale: false  }),
      });
      await newUser.save();
      //make 5 posts with this user
       for (let x=0; x<5; x++){ 
        const newPost = new Post({
            from: newUser,
            date: faker.date.between({ from: '2024-08-01T00:00:00.000Z', to: '2024-10-19T00:00:00.000Z' }),
            message: quotes[quoteIndex].quote,
        });
        await newPost.save();
        quoteIndex++
       }
    } 
    res.status(200).json({
      message: "Populate operation completed successfully"
    });  

  } catch (err) {
      res.send(err);
  }

})








/*----------------------------- IMAGES------------------------------------- */

const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

//tap into "upload", which we import from passport.js
//this is a middleware function that will accept the image data from the client side form data as long as it's called image (which is exactly what we called it in the react app formData.append("image", file))
router.post('/uploadprofilepic/:userid', upload.single('image'), async (req, res) => {

  //req.file.buffer to access the image data that's stored in the memory. we have stored it into memory in multer config in passport.js 
  const b64 = Buffer.from(req.file.buffer).toString("base64");
  //make data readable/usable
  let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

  const imageName = req.file.filename;
  const userid = req.params.userid;
  const user = await User.findOne({ _id: userid });

  try {
    //upload the image to cloudinary
    const uploadResult = await cloudinary.uploader
      .upload(
        dataURI, //image file to upload
        {
          public_id: imageName,
        }
      )
      .catch((error) => {
        console.log(error);
      });

    //change the db based on upload url
    user.uploadedpic = uploadResult.secure_url;
    const result = await user.save();
    console.log("image saved! filename: " + req.file.filename);

    //update all Post model instances where "from" field has this user
    await Post.updateMany({ "from._id": userid },
      {
        $set: {
          "from.$.uploadedpic": uploadResult.secure_url,
        }
      }
    );

    //update all Post model instances where "comments" field has this user
    const postsWithUserComments = await Post.find({
      "comments.from._id": userid
    });

    postsWithUserComments.forEach(async (post) => {
      post.comments.forEach(comment => {
        comment.from.forEach(user => {
          if (user._id.toString() === userid.toString()) {
            //update the fields
            user.uploadedpic = uploadResult.secure_url;
          }
        });
      });
      await post.save();
    });

    //update all Follower model instances where "user" field, "following" field or "followed" field has this user
    const updateFollowers = await Follower.updateMany(
      {
        $or: [ // $or condition allows the query to look in all three arrays (user, following, followedby).
          { "user._id": userid },
          { "following._id": userid },
          { "followedby._id": userid }
        ]
      },
      {
        $set: {
          "user.$[elem].uploadedpic": uploadResult.secure_url,
          "following.$[elem].uploadedpic": uploadResult.secure_url,
          "followedby.$[elem].uploadedpic": uploadResult.secure_url
        }
      },
      {
        arrayFilters: [{ "elem._id": userid }] // update only the elements that match the user id
      }
    );

    res.send(updateFollowers);

  } catch (err) {
    res.send(err);
  }

});

//image sent in message input
router.post("/imagesent", upload.single('image'), async (req, res) => {

  console.log('File received:', req.file); 

  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }

  //req.file.buffer to access the image data that's stored in the memory. we have stored it into memory in multer config in passport.js 
  const b64 = Buffer.from(req.file.buffer).toString("base64");
  //make data readable/usable
  let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

  const imageName = req.file.filename 
  const msgFrom = JSON.parse(req.body.from).currentUser
  const date = JSON.parse(req.body.date)

  try {
    if (req.isAuthenticated){
      // upload the image to cloudinary
      const uploadResult = await cloudinary.uploader
      .upload(
          dataURI, //image file to upload
          {
              public_id: imageName,
          } 
      )
      .catch((error) => {
          console.log(error);
      });

      //save the image url to db
      const newMessage = new Post({
          from: msgFrom,
          date: date,
          image: uploadResult.secure_url,
      });
      const result = newMessage.save();
      console.log("Image uploaded successfully!")
      res.send(result)
    } else{
      res.send(JSON.stringify("Not authenticated!"));
    }

  } catch (err) {
      res.send(err);
  }
 
});













module.exports = router


