//post model
const mongoose = require("mongoose");
const userSchema = require('./user').schema;
const commentSchema = require('./comment').schema;

const postSchema = new mongoose.Schema ({
  from: {
    type: [userSchema],        
    unique: false,
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
  likedby: {
    type: [userSchema],
    unique: false,
    required: false,
  },
  likeCount: {
    type: Number,
    unique: false,
    required: true,
    default: 0
  },
  comments: {
    type: [commentSchema],
    unique: false,
    required: false,
  },
  commentCount: {
    type: Number,
    unique: false,
    required: true,
    default: 0
  },
});

//add indexes for frequently queried fields to improve performance while searching in these fields
postSchema.index({ "comments.from._id": 1 });
postSchema.index({ date: -1 });
postSchema.index({ "likedby._id": 1 });

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const Post = mongoose.models.posts || mongoose.model("posts", postSchema);

module.exports = Post;
module.exports.schema = postSchema;