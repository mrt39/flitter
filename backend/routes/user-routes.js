//user routes for profile, following, user data
const router = require("express").Router();
const User = require("../models/user");
const Post = require("../models/post");
const Follower = require("../models/follower");
const { isAuthenticated } = require("../utilities/auth-middleware");
const { errorResponse } = require("../utilities/error-handler-middleware");
const { validateUserProfile } = require("../utilities/validators");

//get all users
router.get("/getallusers", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.send(allUsers);
  } catch (err) {
    res.send(err);
  }
});

//get a user's info based on their id
router.get("/profile/:userid", async (req, res) => {
  const userID = req.params.userid; // access URL variable
  try {
    const user = await User.find({_id: userID});
    res.send(user);
  } catch (err) {
    res.send(err);
  }
});

//get a user's info based on their short id
router.get("/profile-shortId/:shortId", async (req, res) => {
  const shortId = req.params.shortId; // access URL variable
  try {
    const user = await User.find({shortId: shortId});
    res.send(user);
  } catch (err) {
    res.send(err);
  }
});

//Edit user profile
router.patch("/editprofile/:userid", validateUserProfile, async (req, res) => {
  const userid = req.params.userid; // access URL variable
  const user = await User.findOne({_id: userid});
  const newName = req.body.name;
  const newEmail = req.body.email;
  const bio = req.body.bio;

  console.log(req.body.name + " is the new name for this user: " + user.name);
  
  try {
    user.name = newName;
    user.email = newEmail;
    user.bio = bio;
   
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

    res.send(updateFollowers);
  } catch (err) {
    res.send(err);
  }
});

//follow and unfollow a user 
router.post("/followUser", isAuthenticated, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});

//get the follower info of user based on their short id
router.get("/followers/:shortid", async (req, res) => {
  const shortId = req.params.shortid; // access URL variable
  try {
    const followerData = await Follower.find({user: {$elemMatch: {shortId: shortId}}});
    res.send(followerData);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;