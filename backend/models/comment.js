//comment model

const mongoose = require("mongoose");
const userSchema = require('./user').schema;

//model for comments under posts
const commentSchema = new mongoose.Schema ({
  from: {
    type: [userSchema],        
    unique: false,
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