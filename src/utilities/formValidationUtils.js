//utility functions for form validation across the application

//validate email address
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  //validate text field for required value
  function validateRequired(value) {
    return value.trim() !== '';
  }
  
  //validate name field
  function validateName(name, maxLength = 30) {
    return name.trim() !== '' && name.length <= maxLength;
  }
  
  //validate bio field
  function validateBio(bio, maxLength = 50) {
    return bio.length <= maxLength;
  }
  
  //validate email field length
  function validateEmailLength(email, maxLength = 50) {
    return email.length <= maxLength;
  }
  
  
  export {
    validateEmail,
    validateRequired,
    validateName,
    validateBio,
    validateEmailLength,
  };