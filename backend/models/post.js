//post model

/**
 * ObjectId + ref Usage:
 * ---------------------------
 *in Mongoose, instead of embedding full objects (like using type: [userSchema] here for "from" and "likedby" fields),
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


const postSchema = new mongoose.Schema ({
  from: {
    //user who created the post
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  date: {
    /* store current date as miliseconds from epoch:
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date */
    type: String,
    default: Date.now, // Automatically sets the current date if not provided

  },
  message: {
    type: String,
    unique: false,
    required: false,
  },
  image: {
    type: String,
    unique: false,
    required: false,
  },
  likedby: [
    {
      //users who liked the post
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", //tells Mongoose this ObjectId refers to a document in the 'users' collection
      required: false,
    },
  ],
  likeCount: {
    type: Number,
    unique: false,
    required: true,
    default: 0
  },
  comments: [
    {
      //comments on this post
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments", //tells Mongoose this ObjectId refers to a document in the 'comments' collection
      required: false,
    },
  ],
  commentCount: {
    type: Number,
    unique: false,
    required: true,
    default: 0
  },
});

//add indexes for frequently queried fields to improve performance while searching in these fields
postSchema.index({ "comments": 1 });
postSchema.index({ date: -1 });
postSchema.index({ likedby: 1 });

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const Post = mongoose.models.posts || mongoose.model("posts", postSchema);

module.exports = Post;
module.exports.schema = postSchema;