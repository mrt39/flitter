const passport = require("passport");
//google auth
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter');
const LocalStrategy = require('passport-local').Strategy;
//dayjs
const dayjs = require('dayjs')

// for generating random short ID for users 
const ShortUniqueId = require('short-unique-id');

/* MONGOOSE */
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")
//mongoose findorcreate
const findOrCreate = require('mongoose-findorcreate')

//dotenv for environment variables
require('dotenv').config();

// Define the database URL to connect to.
const dev_db_url = "mongodb://127.0.0.1:27017/flitterDB"
const mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB);

const SERVER_URL = process.env.SERVER_URL;


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
    /* google pic */
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

  },
    bio: {
      type: String,
      unique: false,
      required: false,
      maxlength: 100
  },
  followingtheseID: 
  {
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
  followedbytheseID: 
  {
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

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const User = mongoose.models.users || mongoose.model("users", userSchema);




//model for comments under posts

const commentSchema = new mongoose.Schema ({
  from: {type: [userSchema],        
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
const Comment = mongoose.models.comments ||mongoose.model("comments", commentSchema);





//model for posts

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

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const Post = mongoose.models.posts ||mongoose.model("posts", postSchema);



//model for followers

const followerSchema = new mongoose.Schema ({
  user: {type: [userSchema],        
    unique: false,
    required: true, 
  },
  following: 
  {type: [userSchema],        
    unique: false,
    required: false, 
  },
  followedby: 
  {type: [userSchema],        
    unique: false,
    required: false, 
  },
});

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const Follower = mongoose.models.followers ||mongoose.model("followers", followerSchema);


/* --------------------------------- END OF MONGOOSE ------------------------------------- */






/* MULTER SETUP (for storing images on db) */
var multer = require('multer');

const storage = multer.memoryStorage()  // store image in memory, as we will be directly uploading it to remote without saving it to disk
const upload = multer({storage:storage})

/* END OF MULTER */

passport.use(User.createStrategy());

//google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: SERVER_URL+"/auth/google/callback",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
},
async function(accessToken, refreshToken, profile, done) {
  const existingUser = await User.findOne({ googleId: profile.id });
  //if the user exists with the same id, log in
  if (existingUser) { 
    done(null, existingUser);
  //otherwise, create new user
  } else {
  // Generate a short unique ID
  const { randomUUID } = new ShortUniqueId({ length: 8 });
  const randomShortId= randomUUID();

  const user = await new User({ googleId: profile.id, name: profile.displayName, shortId:randomShortId, picture: profile["_json"].picture, email: profile["_json"].email  }).save();
    done(null, user);
  }
  }
));

//twitter strategy
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: SERVER_URL+"/auth/twitter/callback",
},
async function(accessToken, refreshToken, profile, done) {
  const existingUser = await User.findOne({ googleId: profile.id });
  //if the user exists with the same id, log in
  if (existingUser) { 
    done(null, existingUser);
  //otherwise, create new user
  } else {
  // Generate a short unique ID
  const { randomUUID } = new ShortUniqueId({ length: 8 });
  const randomShortId= randomUUID();

  const user = await new User({ googleId: profile.id, name: profile.username, shortId:randomShortId, picture: profile["photos"][0].value}).save();
    done(null, user);
  }
  }
));



// Serialize User to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize User from session
passport.deserializeUser((id, done) => {
  User.findById(id)
      .then(user => {
          done(null, user);
      })
      .catch(err => {
          done(err, null);
      });
});


//exporting User and Message models and upload attribute in order to use them in routes.js 
module.exports = {Follower, Comment, Post, User, upload, passport}


