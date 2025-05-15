//follower model

/**
 * ObjectId + ref Usage:
 * ---------------------------
 *in mongoose, instead of embedding full objects (like using type: [userSchema] here for all three fields),
 *it is possible to store a reference to another document using `mongoose.Schema.Types.ObjectId`.
 *this reference is linked to a model via the `ref` property.
 * 
 *this is beneficial for:
 * -avoiding data duplication (not copying User model into every post/comment/etc.).
 * -enabling `.populate()` to auto-fetch full referenced documents when needed.
 * -keeping a single source of truth for users that comment on a post, 
 * so when they change their profile data, only User model will be considered to display their info on comments
 */

const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema ({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", //reference to a user
    required: true,
  },
  following: {
    //users this user is following
    type: [mongoose.Schema.Types.ObjectId],
    ref: "users", //tells mongoose this ObjectId refers to a document in the 'users' collection
    required: false,
  },
  followedby: {
    //users who follow this user
    type: [mongoose.Schema.Types.ObjectId],
    ref: "users", //tells mongoose this ObjectId refers to a document in the 'users' collection
    required: false,
  },
});

//add indexes for frequently queried fields to improve performance
followerSchema.index({ user: 1 });

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const Follower = mongoose.models.followers || mongoose.model("followers", followerSchema);

module.exports = Follower;