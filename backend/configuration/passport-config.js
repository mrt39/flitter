//passport authentication configuration
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
require('dotenv').config();

const SERVER_URL = process.env.SERVER_URL;

//configure passport strategies
function configurePassport() {
  //local strategy (username/password)
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
    //for generating random data (for the purpose of passport.js, random banners for twitter and google users)
    const { faker } = require('@faker-js/faker');
    //generate a short unique id
    const ShortUniqueId = require('short-unique-id');
    const { randomUUID } = new ShortUniqueId({ length: 8 });
    const randomShortId= randomUUID();

    const user = await new User({ googleId: profile.id, name: profile.displayName, shortId:randomShortId, 
      picture: profile["_json"].picture, email: profile["_json"].email, 
      banner: faker.image.urlPicsumPhotos({ height: 200, width: 600, blur: 0, grayscale: false  })  })
      .save();
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
    const existingUser = await User.findOne({ twitterId: profile.id });
    //if the user exists with the same id, log in
    if (existingUser) { 
      console.log(profile["photos"])
      done(null, existingUser);
    //otherwise, create new user
    } else {
    // Generate a short unique ID
    const { faker } = require('@faker-js/faker');
    const ShortUniqueId = require('short-unique-id');
    const { randomUUID } = new ShortUniqueId({ length: 8 });
    const randomShortId= randomUUID();

    const user = await new User({ twitterId: profile.id, name: profile.username, shortId:randomShortId, 
      picture: profile["photos"][0].value.replace(/_normal(?=\.\w+$)/, ""), 
      banner: faker.image.urlPicsumPhotos({ height: 200, width: 600, blur: 0, grayscale: false  }) })
      .save();
      done(null, user);
    }
    }
  ));

  //serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  //deserialize User from session
  passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
  });

  return passport;
}

module.exports = configurePassport;