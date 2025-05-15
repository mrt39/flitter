//image upload routes for profile pictures and post images
const router = require("express").Router();
const User = require("../models/user");
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
  //find the user by id, this will be the single source of truth for user data
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

    //not updating Post, Follower or Comment models here to update user's profile picture in those,
    //in user's already made posts, follows or comments, these models will reference user by id 
    //they will automatically reflect the updated uploadedpic without manual updates
    //and populate() will be used to update all Post model instances where "from" field has this user

    res.send(result);

  } catch (err) {
    res.send(err);
  }
});

module.exports = router;