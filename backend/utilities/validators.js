//input validation functions

//validate user profile updates
function validateUserProfile(req, res, next) {
    const { name, email, bio } = req.body;
    const errors = [];
  
    //checks if the input is string
    if (name && typeof name !== 'string') {
      errors.push('Name must be a string');
    }
    
    //checks if name exceeds maximum length
    if (name && name.length > 30) {
      errors.push('Name cannot exceed 30 characters');
    }
    
    //checks if email is valid
    if (email && email.length > 0) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.push('Email format is invalid');
      }
      
      //checks if email exceeds maximum length
      if (email.length > 50) {
        errors.push('Email cannot exceed 50 characters');
      }
    }
    
    //checks if bio exceeds maximum length
    if (bio && bio.length > 100) {
      errors.push('Bio cannot exceed 100 characters');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    next();
  }
  
  //validate image upload
  function validateImageUpload(req, res, next) {
    //checks if file exists
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    
    //checks file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).send('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.');
    }
    
    //checks file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).send('File too large. Maximum size is 5MB.');
    }
    
    next();
  }
  
  //validate post submission
  function validatePostSubmission(req, res, next) {
    const { message } = req.body;
    const errors = [];
    
    //checks if message exists when no image is provided
    if (!message && !req.file) {
      errors.push('Post must contain either text or an image');
    }
    
    //checks if message exceeds maximum length
    if (message && message.length > 280) {
      errors.push('Message cannot exceed 280 characters');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    next();
  }
  
  module.exports = {
    validateUserProfile,
    validateImageUpload,
    validatePostSubmission
  };