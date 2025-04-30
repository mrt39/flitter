//image upload routes for profile pictures and post images
const router = require("express").Router();
const User = require("../models/user");
const Post = require("../models/post");
const Follower = require("../models/follower");
const { isAuthenticated } = require("../utilities/auth-middleware");
const { validateImageUpload } = require("../utilities/validators");
const { upload } = require("../configuration/multer-config");
const { prepareImageForUpload, uploadImageToCloudinary } = require("../utilities/cloudinary-helper");

//tap into "upload", which we import from passport.js
//this is a middleware function that will accept the image data from the client side form data as long as it's called image (which is exactly what we called it in the react app formData.append("image", file))
router.post('/uploadprofilepic/:userid', upload.single('image'), validateImageUpload, async (req, res) => {
  
  //req.file.buffer to access the image data that's stored in the memory
  const dataURI = prepareImageForUpload(req);
  const imageName = req.file.filename;
  const userid = req.params.userid;
  const user = await User.findOne({ _id: userid });

  try {
    //upload the image to cloudinary
    const uploadResult = await uploadImageToCloudinary(dataURI, {
      public_id: imageName,
    });

    //change the db based on upload url
    user.uploadedpic = uploadResult.secure_url;
    const result = await user.save();
    console.log("image saved! filename: " + req.file.filename);

    //update all Post model instances where "from" field has this user
    await Post.updateMany({ "from._id": userid },
      {
        $set: {
          "from.$.uploadedpic": uploadResult.secure_url,
        }
      }
    );

    //update all Post model instances where "comments" field has this user
    const postsWithUserComments = await Post.find({
      "comments.from._id": userid
    });

    postsWithUserComments.forEach(async (post) => {
      post.comments.forEach(comment => {
        comment.from.forEach(user => {
          if (user._id.toString() === userid.toString()) {
            //update the fields
            user.uploadedpic = uploadResult.secure_url;
          }
        });
      });
      await post.save();
    });

    //update all Follower model instances where "user" field, "following" field or "followed" field has this user
    const updateFollowers = await Follower.updateMany(
      {
        $or: [ // $or condition allows the query to look in all three arrays (user, following, followedby).
          { "user._id": userid },
          { "following._id": userid },
          { "followedby._id": userid }
        ]
      },
      {
        $set: {
          "user.$[elem].uploadedpic": uploadResult.secure_url,
          "following.$[elem].uploadedpic": uploadResult.secure_url,
          "followedby.$[elem].uploadedpic": uploadResult.secure_url
        }
      },
      {
        arrayFilters: [{ "elem._id": userid }] // update only the elements that match the user id
      }
    );

    res.send(updateFollowers);

  } catch (err) {
    res.send(err);
  }
});

module.exports = router;