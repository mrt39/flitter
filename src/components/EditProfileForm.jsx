//component for profile editing form, used in EditProfileModal

/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { TextField, Box, Button } from '@mui/material';
import { useUI } from '../contexts/UIContext.jsx';
import { validateName, validateBio, validateEmailLength, validateEmail } from '../utilities/formValidationUtils.js';
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
    
  }, [currentUser]);

  //real-time form validation using formValidationUtils, anytime values change
  useEffect(() => {
    const newErrors = {
      name: !validateName(values.name),
      bio: !validateBio(values.bio),
      email: values.email ? (!validateEmailLength(values.email) || !validateEmail(values.email)) : false,
    };

    setErrors(newErrors);

    //check if any error exists, don't let submit if so
    const hasAnyError = newErrors.name || newErrors.bio || newErrors.email;
    setHasErrors(hasAnyError);
  }, [values]);


  function handleChange(event) {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
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
        helperText={errors.name ? 'Name cannot exceed 30 characters' : ' '}
      />
      
      {!currentUser.twitterId && (
        <TextField
          disabled={loading || currentUser.googleId || currentUser.email === "demoacc@demoacc.com"}
          fullWidth
          error={errors.email}
          helperText={errors.email ? 'Invalid E-mail address!' : ' '}
          label="E-mail Address"
          name="email"
          type="email"
          required
          onChange={handleChange}
          value={values.email}
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
        helperText={errors.bio ? 'Bio cannot exceed 50 characters' : ' '}
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