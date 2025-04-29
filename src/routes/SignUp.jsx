/* eslint-disable react/prop-types */
import { Link as RouterLink, useNavigate} from "react-router-dom";
import { useState, useEffect} from 'react'
import { useUI } from '../contexts/UIContext.jsx';
import { registerUser } from '../utilities/authService.js';
import '../styles/SignUp.css'
import { Avatar, Button, CssBaseline, TextField, Grid, Box } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { clean } from 'profanity-cleaner';
import { validateName, validateEmail, validateRequired } from '../utilities/formValidationUtils.js';


export default function SignUp() {

  const navigate = useNavigate(); 

  const {darkModeOn, setSnackbarOpenCondition, setSnackbarOpen } = useUI();  

  const [submitted, setSubmitted] = useState(false);
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false
  });

  //set the touched state for each field, so that validation checks occur for each field only after they're touched by the user (when the user types something in a field)
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false
  });

  const [hasErrors, setHasErrors] = useState(false);

  //real-time form validation using formValidationUtils
  useEffect(() => {
    const newErrors = {
      name: touched.name && (!validateName(signUpData.name) || !validateRequired(signUpData.name)),
      email: touched.email && (!validateEmail(signUpData.email) || !validateRequired(signUpData.email)),
      password: touched.password && !validateRequired(signUpData.password || '')
    };

    setErrors(newErrors);

    //check if any error exists, don't allow submit if so
    const hasAnyError = newErrors.name || newErrors.email || newErrors.password;
    setHasErrors(hasAnyError);
  }, [signUpData, touched]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (hasErrors) {
      return;
    } else {
      setSubmitted(true);
    }
  };

  function handleChange(event) {

    const name = event.target.name
    const value = event.target.value

    setSignUpData({
      ...signUpData,
      [name]: value
    });

    //mark field as touched when user types
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }

  function getNameHelperText() {
    if (!signUpData.name) {
      return "Name field cannot be empty";
    } else if (!validateName(signUpData.name)) {
      return "Name cannot exceed 30 characters";
    }
    return null;
  }

  function getEmailHelperText() {
    if (!signUpData.email) {
      return "Email field cannot be empty";
    } else if (!validateEmail(signUpData.email)) {
      return "Invalid email address";
    }
    return null;
  }

  useEffect(() => {
    if (submitted) {
      //on submit, clean the word with the profanity cleaner package
      //https://www.npmjs.com/package/profanity-cleaner
      const filteredName = clean(signUpData.name, { keepFirstAndLastChar: true }); 

      registerUser(filteredName, signUpData.email, signUpData.password)
        .then(data => {
          // Successfully registered
          setSnackbarOpenCondition("successfulRegister");
          setSnackbarOpen(true);
          navigate('/login');
        })
        .catch(error => {
          console.error('Error:', error);
          // Check if user already exists
          if (error.message.includes('already registered')) {
            setSnackbarOpenCondition("alreadyRegistered");
          } else {
            setSnackbarOpenCondition("failure");
          }
          setSnackbarOpen(true);
          setSubmitted(false);
        });
    }
  }, [submitted]);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon id="lockIcon1" />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField 
            margin="normal"
            fullWidth
            className="loginSignupTextField"
            id="name"
            label="Name"
            type="name"
            name="name"
            autoComplete="name"
            autoFocus
            required
            onChange={handleChange}
            error={errors.name}
            helperText={errors.name ? getNameHelperText() : ' '}
          />
          <TextField 
            margin="normal"
            fullWidth
            className="loginSignupTextField"
            id="email"
            label="E-mail Address"
            type="email"
            name="email"
            required
            autoComplete="email"
            onChange={handleChange}
            error={errors.email}
            helperText={errors.email ? getEmailHelperText() : ' '}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            className="loginSignupTextField"
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={handleChange}
            error={errors.password}
            helperText={errors.password ? "Password field cannot be empty" : ' '}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={hasErrors}
          >
            Sign Up
          </Button>
          
          <Grid container className="loginSignupLinkContainer">
            <Grid item>
              <RouterLink className={`signUpLink ${darkModeOn ? 'dark-mode' : ''}`} to="/login">
                  {"Already have an account? Sign in"}
              </RouterLink>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}