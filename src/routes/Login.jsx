/* eslint-disable react/prop-types */
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect} from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import { loginUser } from '../utilities/authService.js';
import { Navigate } from "react-router-dom";
import { Avatar, Button, CssBaseline, TextField, Grid, Box } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Footer from "../components/Footer.jsx";
import GoogleLogo from '../assets/google-logo.png';
import XLogo from '../assets/x-logo.png';
import '../styles/Login.css'


export default function Login() {


  //use context hooks
  const { currentUser } = useAuth(); 
  const {darkModeOn, setSnackbarOpenCondition, setSnackbarOpen } = useUI(); 

  const navigate = useNavigate();
  const [clickedLogin, setClickedLogin] = useState(false);
  const [loginData, setLoginData] = useState({ });

  function handleGoogleClick () {
      window.open(import.meta.env.VITE_BACKEND_URL+"/auth/google", "_self");
  }

  function handleTwitterClick () {
    window.open(import.meta.env.VITE_BACKEND_URL+"/auth/twitter", "_self");
}

  function handleDemoSigninClick(){
    setLoginData({email:"demoacc@demoacc.com" , password: import.meta.env.VITE_DEMOACC_PW})
    setClickedLogin(true)
  }

  function handleChange (event) {
    setLoginData({
        ...loginData,
        [event.target.name]: event.target.value
  });
  }


  const handleSubmit = (event) => {
    event.preventDefault();
    setClickedLogin(true)
  };

  useEffect(() => {
    // Redirect if already logged in
    if (currentUser) {
      navigate('/');
      return;
    }
    
    if (clickedLogin) {
      loginUser(loginData.email, loginData.password)
        .then(data => {
          // Check if login was successful
          if (data) {
            // Login successful, set currentUser in context
            window.location.reload();
          } else {
            throw new Error('Login failed');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setSnackbarOpenCondition("wrongLoginDeets");
          setSnackbarOpen(true);
          setClickedLogin(false);
        });
    }
  }, [clickedLogin]);




  return (
  <>
    {currentUser? <Navigate to="/" />
    : ""}
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
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              className="loginSignupTextField"
              id="email"
              label="E-mail Address"
              type="email"
              name="email"
              onChange={handleChange}
              autoComplete="email"
              autoFocus
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
              onChange={handleChange}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            
            <Button
              id="googleSignInBtn"
              type="button"
              onClick={handleGoogleClick}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, }} 
              startIcon={<img src={GoogleLogo} alt="Google logo" style={{ width: 24, height: 24 }} />}>
              Sign In With Google
            </Button>

            <Button
              id="twitterSignInBtn"
              type="button"
              onClick={handleTwitterClick}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, }} 
              startIcon={<img src={XLogo} alt="X logo" style={{ width: 24, height: 24 }} />}>
              Sign In With X
            </Button>

            <Button
            id="signinWithDemoAcc"
              type="button"
              onClick={handleDemoSigninClick}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In With Demo Account
            </Button>

            <Grid container className="loginSignupLinkContainer">
              <Grid item>
                <RouterLink className={`signUpLink ${darkModeOn ? 'dark-mode' : ''}`} to="/signup">
                    {"Don't have an account? Sign Up"}
                </RouterLink>
              </Grid>
            </Grid>
          </Box>
        </Box>

      </Container>
      <Footer/>
    </>
  );
}