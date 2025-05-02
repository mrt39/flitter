//component for profile editing form, used in EditProfileModal

/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { TextField, Box, Button } from '@mui/material';
import { useUI } from '../contexts/UIContext.jsx';
import { validateName, validateBio, validateEmailLength, validateEmail, validateRequired } from '../utilities/formValidationUtils.js';
import '../styles/EditProfileModal.css';

function ProfileForm({ 
  currentUser, 
  onSubmit, 
  loading = false 
}) {
  const { darkModeOn} = useUI();
  
  const [values, setValues] = useState({
    name: currentUser ? currentUser.name : '',
    email: currentUser ? currentUser.email : '',
    bio: currentUser ? currentUser.bio : '',
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    bio: false
  });

   //set the touched state for each field, so that validation checks occur for each field only after they're touched by the user (when the user types something in a field)
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    bio: false
  });

  const [hasErrors, setHasErrors] = useState (false)
    
  //reset form values and errors when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setValues({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
      });
    }

    setErrors({
      name: false,
      email: false,
      bio: false
    });

    //reset touched state when currentUser changes
    setTouched({
      name: false,
      email: false,
      bio: false
    });
    
  }, [currentUser]);

  //real-time form validation using formValidationUtils, anytime values change
  useEffect(() => {
    const newErrors = {
      name: touched.name && (!validateName(values.name) || !validateRequired(values.name)),
      bio: touched.bio && !validateBio(values.bio),
      //if the user registered via email (not with Google account or X account), email is required
      email: touched.email && (
        (!currentUser.twitterId && !currentUser.googleId) 
        ? 
        (!validateRequired(values.email) || !validateEmail(values.email) || !validateEmailLength(values.email))
        : 
        (values.email ? (!validateEmail(values.email) || !validateEmailLength(values.email)) : false)
      ) 
    };

    setErrors(newErrors);

    //check if any error exists, don't let submit if so
    const hasAnyError = newErrors.name || newErrors.bio || newErrors.email;
    setHasErrors(hasAnyError);
  }, [values, touched]);

  function getNameHelperText() {
    if (!values.name) {
      return "Name field cannot be empty!";
    } else if (!validateName(values.name)) {
      return "Name cannot exceed 30 characters";
    }
    return " ";
  }
  
  function getEmailHelperText() {
    if ((!currentUser.twitterId && !currentUser.googleId) && !values.email) {
      return "Email field cannot be empty!";
    } else if (values.email && !validateEmail(values.email)) {
      return "Invalid email address!";
    } else if (values.email && !validateEmailLength(values.email)) {
      return "Email cannot exceed 50 characters!";
    }
    return " ";
  }
  
  function getBioHelperText() {
    if (!validateBio(values.bio)) {
      return "Bio cannot exceed 50 characters!";
    }
    return " ";
  }


  function handleChange(event) {

    const name = event.target.name
    const value = event.target.value

    setValues({
      ...values,
      [name]: value
    });

    //mark field as touched when user types
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }
  

  function handleSubmit(event) {
    event.preventDefault();
  
    //submit if no validation errors
    if (!hasErrors) {
      onSubmit(values);
    }
  }

  return (
    <Box className="profileFieldsBox">
      <TextField
        disabled={loading || currentUser.email === "demoacc@demoacc.com"}
        fullWidth
        label="Name"
        name="name"
        onChange={handleChange}
        required
        value={values.name}
        error={errors.name}
        helperText={errors.name ? getNameHelperText() : ' '}
      />
      
      {!currentUser.twitterId && (
        <TextField
          disabled={loading || currentUser.googleId || currentUser.email === "demoacc@demoacc.com"}
          fullWidth
          label="E-mail Address"
          name="email"
          type="email"
          required
          onChange={handleChange}
          value={values.email}
          error={errors.email}
          helperText={errors.email ? getEmailHelperText() : ' '}
        />
      )}
      
      <TextField
        disabled={loading || currentUser.email === "demoacc@demoacc.com"}
        fullWidth
        id="bio"
        label="Bio"
        name="bio"
        multiline
        rows={4}
        placeholder="Enter Your Bio"
        onChange={handleChange}
        value={values.bio}
        error={errors.bio}
        helperText={errors.bio ? getBioHelperText() : ' '}
      />
      
      <Button
        variant="outlined"
        size="small"
        onClick={handleSubmit}
        disabled={loading || currentUser.email === "demoacc@demoacc.com"}
        className="saveImageButton"
        sx={{
          borderRadius: '9999px', 
          textTransform: 'none',
          padding: '6px 16px',
          borderColor: (darkModeOn ? 'white' : 'gray'),
          backgroundColor: (darkModeOn ? 'rgb(239, 243, 244)' : 'rgb(15, 20, 25);'),
          color: (darkModeOn ? 'black' : 'white'),
          '&:hover': {
            backgroundColor:(darkModeOn ? 'rgb(215, 219, 220)' : 'rgb(39, 44, 48);'),
            borderColor: (darkModeOn ? 'white' : 'gray'),
            color:(darkModeOn ? 'black' : 'white'),
          },
          mt: 2
        }}
      >
        Save
      </Button>
    </Box>
  );
}

export default ProfileForm;