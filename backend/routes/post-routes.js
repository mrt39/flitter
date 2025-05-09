//post routes for creating, reading, liking, commenting on posts
const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const { isAuthenticated } = require("../utilities/auth-middleware");
const { errorResponse } = require("../utilities/error-handler-middleware");
const { validatePostSubmission } = require("../utilities/validators");
const { upload } = require("../configuration/multer-config");
const { prepareImageForUpload, uploadImageToCloudinary } = require("../utilities/cloudinary-helper");

//get all posts to display 
router.get("/getallposts", async (req, res) => {
  try {
    //populate is a mongoose method that replaces objectId references with the actual referenced document
    //here we are populating the "from" field in each post so we can get the latest name and profile picture
    //this design avoids denormalization and keeps a single source of truth, which is the User model
    const allPosts = await Post.find()
      .populate("from", "name shortId picture uploadedpic") //only populating selected fields for performance
      .populate("likedby", "_id") //only populating selected fields for performance
      .populate({
        path: "comments",
        populate: {
          path: "from",
          select: "name shortId picture uploadedpic shortId", //only populating selected fields for performance
        },
      });
    res.send(allPosts);
  } catch (err) {
    res.send(err);
  }
});

//get a single post by ID
router.get("/getsingularpost/:postid", async (req, res) => {
  const postID = req.params.postid // access URL variable
  try {
    //populate the from and comment authors so we always get up-to-date user data
    const singularPost = await Post.findOne({_id: postID})
      .populate("from", "name shortId picture uploadedpic")
      .populate("likedby", "_id") //only populating selected fields for performance
      .populate({
        path: "comments",
        populate: {
          path: "from",
          select: "name shortId picture uploadedpic"
        },
      });
    res.send(singularPost);
  } catch (err) {
    res.send(err);
  }
});

// submit a new post 
router.post("/submitPost", isAuthenticated, validatePostSubmission, async (req, res) => {
  try {
    const newPost = new Post({
      from: req.body.from._id, //storing id as this is an ObjectId - user in db.
      date: req.body.date,
      message: req.body.message,
    });
    const result = await newPost.save();

    //populate the response before sending to frontend
    //this is critical for the cache system on frontend to work correctly - our db's post model only stores references for "from" field, 
    //and cache needs complete user data objects, not just IDs
    //without this population, the cache would store references instead of actual user data
    //which leads to missing fields like shortId, picture, etc. when rendering from cache
    const populatedPost = await Post.findById(result._id)
      .populate("from", "name shortId picture uploadedpic");
    
    res.send(populatedPost);
    console.log("Post submitted successfully!");
  } catch (err) {
    res.send(err);
  }
});

//like a post 
router.patch("/likePost", isAuthenticated, async (req, res) => {
  try {
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
      likedPost.likedby.push(likingUser._id)
    }

    const result = await likedPost.save();
    console.log("Post liked successfully!")
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

// comment on a post 
router.post("/sendCommentonPost", isAuthenticated, async (req, res) => {
  try {
    //find the post that is commented on
    const commentedPost = await Post.findOne({_id: req.body.toPostID});

    const newComment = new Comment({
      from: req.body.from._id, //storing id as this is an ObjectId - user in db.
      date: req.body.date,
      toPostID: req.body.toPostID,
      comment: req.body.comment,
    });
    
    await newComment.save();

    //put the comment in the comments array of the post 
    commentedPost.comments.push(newComment._id); //storing id as this is an ObjectId - user in db.
    //increase the commentCount property by 1
    commentedPost.commentCount += 1;  
    //save the post
    const result = await commentedPost.save();

    //populate the comment and user data before sending response
    //since our db's post model only stores references for "comments" field,
    //this ensures the frontend cache receives a complete object graph with all necessary user data
    //without this, the cache would store only objectId references that can't be properly displayed
    //critical for the frontend to render comments with proper user information from cache
    const populatedPost = await Post.findById(result._id)
      .populate("from", "name shortId picture uploadedpic")
      .populate("likedby", "_id")
      .populate({
        path: "comments",
        populate: {
          path: "from",
          select: "name shortId picture uploadedpic shortId"
        },
      });
    
    res.send(populatedPost);
    console.log("Comment submitted successfully!");
  } catch (err) {
    res.send(err);
  }
});

//image sent in message input
router.post("/imagesent", upload.single('image'), isAuthenticated, async (req, res) => {
  console.log('File received:', req.file); 

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const dataURI = prepareImageForUpload(req);
  const imageName = req.file.filename;
  const msgFrom = JSON.parse(req.body.from).currentUser._id; //storing id as this is an ObjectId - user in db.
  const date = JSON.parse(req.body.date);

  try {
    const uploadResult = await uploadImageToCloudinary(dataURI, {
      public_id: imageName,
    });

    //save the image url to db
    const newMessage = new Post({
      from: msgFrom,
      date: date,
      image: uploadResult.secure_url,
    });
    const result = await newMessage.save();

    //populate the response before sending to frontend
    //this is critical for the cache system on frontend to work correctly - our db's post model only stores references for "from" field, 
    //and cache needs complete user data objects, not just IDs
    //without this population, the cache would store references instead of actual user data
    //which leads to missing fields like shortId, picture, etc. when rendering from cache
    const populatedPost = await Post.findById(result._id)
      .populate("from", "name shortId picture uploadedpic");

    console.log("Image uploaded successfully!");
    res.send(populatedPost);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;