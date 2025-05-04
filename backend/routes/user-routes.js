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
    //using find() instead of findOne() to maintain array response format, which is expected by frontend components
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
    //using find() instead of findOne() to maintain array response format, which is expected by frontend components
    const user = await User.find({shortId: shortId});
    res.send(user);
  } catch (err) {
    res.send(err);
  }
});

//edit user profile
router.patch("/editprofile/:userid", validateUserProfile, async (req, res) => {
  const userid = req.params.userid; // access URL variable
  const newName = req.body.name;
  const newEmail = req.body.email;
  const bio = req.body.bio;
  
  try {
    //find the user by id
    const user = await User.findOne({ _id: userid });

    //update user fields
    user.name = newName;
    user.email = newEmail;
    user.bio = bio;
   
    //save
    await user.save();

    //since we are using references with populate, related documents will reflect the updated user data dynamically
    //no need to manually update 'from' fields in Post or Follower models
    
    res.send({ message: "User profile updated successfully." });
  } catch (err) {
    res.send(err);
  }
});

//follow and unfollow a user 
//optimized followUser route with direct mongodb operations and the usage of Promise.all for faster response times
router.post("/followUser", isAuthenticated, async (req, res) => {
  try {
    //get the IDs of both users involved
    const fromUserId = req.body.fromUser._id;
    const toUserId = req.body.toUser._id;

    //User.exists is a MongoDB method that efficiently checks if a document exists
    //without retrieving the entire document to check- this only checks the relevant fields,
    //this is much more efficient than loading whole documents just to check a condition since it transfers much less data from the database
    const isFollowing = await User.exists({ 
      _id: fromUserId, 
      followingtheseID: toUserId 
    });

    //determine if we're following or unfollowing
    const isUnfollow = isFollowing ? true : false;
    
    //calculate the value for incrementing/decrementing follower counts
    const countChange = isUnfollow ? -1 : 1;
    
    //Promise.all is a js feature that allows multiple async operations to execute simultaneously rather than one after another
    //this dramatically improves performance as operations run in parallel instead of sequentially
    //in this case, it updates both user documents at the same time instead of waiting for one update to finish first
    const userUpdates = await Promise.all([
      //User.updateOne is a mongodb method that updates a document in a single operation
      //unlike the fetch-modify-save approach, this directly modifies the document in the database
      //making it much faster as it eliminates multiple round trips between server and database
      User.updateOne(
        { _id: fromUserId },
        {
          //$inc is a mongodb update operator that increments a field by a specified amount
          //it's atomic, meaning it's guaranteed to correctly update the value even if multiple users try to modify it simultaneously
          //much more efficient than reading current value, calculating new value, and saving back
          $inc: { followingCount: countChange },
          //$pull removes values from arrays (deletes), while $addToSet adds values only if they don't exist
          //these operate directly in the database instead of requiring retrieving array, changing them in js and saving them
          //which is much faster and more efficient than the prior approach of findIndex and splice
          [isUnfollow ? '$pull' : '$addToSet']: { followingtheseID: toUserId }
        }
      ),

      //update the user that is being followed/unfollowed (toUser)
      User.updateOne(
        { _id: toUserId },
        {
          $inc: { followerCount: countChange },
          [isUnfollow ? '$pull' : '$addToSet']: { followedbytheseID: fromUserId }
        }
      )
    ]);

    /* ------------------------HANDLING THE Follower MODEL in db----------------------- */

    //update operations for Follower model - run in parallel
    const followerUpdates = await Promise.all([
      //following list update of the user that initiated the follow
      Follower.findOneAndUpdate(
        { user: fromUserId },
        {
          user: fromUserId,
          [isUnfollow ? '$pull' : '$addToSet']: { following: toUserId }
        },
        {
          //upsert: true tells MongoDB to create a new document (it will do so with above dataset) if one doesn't exist
          //this eliminates the need for separate if/else logic to handle create vs update scenarios
          //combining what would otherwise be multiple operations into a single database call
          upsert: true,
          //new: false configures findOneAndUpdate to return the pre-update version of the document when this function resolves, instead of the updating it and returning the updated version. 
          //since we don't use this returned data at all here, keeping this as false prevents unnecessary data transfer from db to app
          //as this operation is only awaiting to ensure the operation completes, not to use the result
          new: false
        }
      ),

      //follower list update of the user that got followed
      Follower.findOneAndUpdate(
        { user: toUserId },
        {
          user: toUserId,
          [isUnfollow ? '$pull' : '$addToSet']: { followedby: fromUserId }
        },
        {
          upsert: true,
          new: false
        }
      )
    ]);

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
    const user = await User.findOne({ shortId: shortId });
    const followerData = await Follower.find({ user: user._id })
      //populate replaces objectIds in the specified path with full documents from the referenced model
      //we use it instead of embedding entire user data inside other documents to avoid data duplication and sync issues
      //if future schemas reference other models (like posts, followers), populate will automatically hydrate them
      .populate('following', 'name shortId picture uploadedpic') //only populating selected fields for performance
      .populate('followedby', 'name shortId picture uploadedpic'); //only populating selected fields for performance
    res.send(followerData);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;