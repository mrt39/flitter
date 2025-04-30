//re-export from new modular files for backward compatibility
const User = require("./models/user");
const Post = require("./models/post");
const Comment = require("./models/comment");
const Follower = require("./models/follower");
const configurePassport = require("./configuration/passport-config");
const { upload } = require("./utilities/multer-config");

//configure passport
const passport = configurePassport();

module.exports = {
  User,
  Post,
  Comment,
  Follower,
  passport,
  upload
};