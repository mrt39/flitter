//comment model

/**
 * ObjectId + ref Usage:
 * ---------------------------
 *in Mongoose, instead of embedding full objects (like using type: [userSchema] here for "from" field),
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
const userSchema = require('./user').schema;

//model for comments under posts
const commentSchema = new mongoose.Schema ({
  from: {
    //reference to the user who made the comment
    type: mongoose.Schema.Types.ObjectId,
    ref: "users", //tells Mongoose this ObjectId refers to a document in the 'users' collection
    required: true,
  },
  toPostID: { //comment to the post, by the post's id
    type: String,        
    unique: false,
    required: true, 
  },
  date: {
    /* store current date as miliseconds from epoch:
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date */
    type: String,
    default: Date.now
  },
  comment: {
    type: String,
    unique: false,
    required: false,
  },
});

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const Comment = mongoose.models.comments || mongoose.model("comments", commentSchema);

module.exports = Comment;
module.exports.schema = commentSchema;