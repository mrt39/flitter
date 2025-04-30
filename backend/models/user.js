//user model

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
//mongoose findorcreate
const findOrCreate = require('mongoose-findorcreate');


//model for users
const userSchema = new mongoose.Schema ({
    email: { 
      type: String, 
      maxlength: 50, 
      unique: false,
      required: false,
    },
    shortId: { 
      type: String,  
      unique: false,
      required: true,
    },
    name: { 
      type: String, 
      maxlength: 30, 
      unique: false,
      required: false,
    },
    password: {
      type: String,
      unique: false,
      required: false,
    },
    googleId: {
      type: String,
      unique: false,
      required: false,
    },
    twitterId: {
      type: String,
      unique: false,
      required: false,
    },
    /* google or twitter pic */
    picture: {
      type: String,
      unique: false,
      required: false,
    },
    /* uploaded pic */
    uploadedpic: {
      type: String,
      unique: false,
      required: false,
    }, /* banner */
    banner: {
      type: String,
      unique: false,
      required: false,
    },
    bio: {
      type: String,
      unique: false,
      required: false,
      maxlength: 100
    },
    followingtheseID: {
      type: [String],
      unique: false,
      required: false, 
    },
    followingCount: {
      type: Number,
      unique: false,
      required: true,
      default: 0
    },
    followedbytheseID: {
      type: [String],        
      unique: false,
      required: false, 
    },
    followerCount: {
      type: Number,
      unique: false,
      required: true,
      default: 0
    },
});

/* change the usernameField as passport by default creates a field named "username" by registering a user and checks for it while logging in. we use "email" field for that */
userSchema.plugin(passportLocalMongoose, {usernameField: "email"});
userSchema.plugin(findOrCreate);

//add index for frequently queried fields to improve performance while searching in these fields
userSchema.index({ shortId: 1 });
userSchema.index({ email: 1, sparse: true });

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const User = mongoose.models.users || mongoose.model("users", userSchema);

module.exports = User;