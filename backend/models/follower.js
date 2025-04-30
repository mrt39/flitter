//follower model
const mongoose = require("mongoose");
const userSchema = require('./user').schema;

const followerSchema = new mongoose.Schema ({
  user: 
  {type: [userSchema],        
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

//add indexes for frequently queried fields to improve performance
followerSchema.index({ "user.shortId": 1 });

//construct the model this way to prevent the "Cannot overwrite model once compiled" error.
const Follower = mongoose.models.followers || mongoose.model("followers", followerSchema);

module.exports = Follower;