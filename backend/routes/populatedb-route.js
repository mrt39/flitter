//utility routes including database population
//this is used for generating random user data (for the purpose of adding users to the app)
const router = require("express").Router();
const User = require("../models/user");
const Post = require("../models/post");
const ShortUniqueId = require('short-unique-id');

const { faker } = require('@faker-js/faker');

//populate route for populating the db
//using faker app: https://fakerjs.dev/api/
router.get("/populate", async (req, res) => {
  var quotes = []
  var quoteIndex = 0

  try {
    //get the quotes data into quotes array
    await fetch("https://gist.githubusercontent.com/camperbot/5a022b72e96c4c9585c32bf6a75f62d9/raw/e3c6895ce42069f0ee7e991229064f167fe8ccdc/quotes.json", {
      method: 'GET',
      })
      .then(response => {
          if (response.ok) {
          return response.json();          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          quotes = data.quotes
      })
      .catch(error => {
          console.error('Error:', error);
      });
  
    //create 20 users with 5 posts each
    for (let i=0; i<20; i++){
      //generate a short unique ID
      const { randomUUID } = new ShortUniqueId({ length: 8 });
      const randomShortId= randomUUID();

      //fetch a random profile picture from randomuser.me API
      const profilePicResponse = await fetch("https://randomuser.me/api/?inc=picture&noinfo");
      let profilePicUrl = '';
      
      if (profilePicResponse.ok) {
        const profilePicData = await profilePicResponse.json();
        //extract the large profile picture URL from the response
        profilePicUrl = profilePicData.results[0].picture.large;
      } else {
        console.error("Failed to fetch profile picture");
        //fallback to faker if randomuser.me API fails
        profilePicUrl = faker.image.urlLoremFlickr({ height: 128, width: 128, category: 'humans' });
      }

      //create a new user
      const newUser = new User({
        shortId: randomShortId,
        name: faker.person.fullName(),
        bio: faker.person.bio(),
        uploadedpic: profilePicUrl,
        banner: faker.image.urlPicsumPhotos({ height: 200, width: 600, blur: 0, grayscale: false  }),
      });
      await newUser.save();
      //create 5 posts with this user
       for (let x=0; x<5; x++){ 
        const newPost = new Post({
            from: newUser._id, //store the referance instead of the user object
            date: faker.date.between({ from: '2025-02-01T00:00:00.000Z', to: '2025-05-10T00:00:00.000Z' }),
            message: quotes[quoteIndex].quote,
        });
        await newPost.save();
        quoteIndex++
       }
    } 
    res.status(200).json({
      message: "Populate operation completed successfully"
    });  

  } catch (err) {
      res.send(err);
  }
});

module.exports = router;