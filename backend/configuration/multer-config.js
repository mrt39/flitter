//multer configuration for file uploads
const multer = require('multer');

//configure storage
const storage = multer.memoryStorage(); // store image in memory, as we will be directly uploading it to remote without saving it to disk

//set up multer upload
//memory storage, accept single file with name "image"
const upload = multer({
  storage: storage
});

module.exports = { upload };