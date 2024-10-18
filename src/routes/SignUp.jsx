/* eslint-disable react/prop-types */
import { Link as RouterLink, useNavigate} from "react-router-dom";
import { useState, useEffect, useContext } from 'react'
import { AppStatesContext } from '../App.jsx';
import '../styles/SignUp.css'
import { Avatar, Button, CssBaseline, TextField, Grid, Box } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Footer from "../components/Footer.jsx";
import { clean } from 'profanity-cleaner';


export default function SignUp() {

  const navigate = useNavigate(); 

  const {setSnackbarOpenCondition, setSnackbarOpen } = useContext(AppStatesContext); 

  const [submitted, setSubmitted] = useState(false);
  const [signUpData, setSignUpData] = useState({ });
  const [emptyNameField, setEmptyNameField] = useState(false);
  const [emptyEmailField, setEmptyEmailField] = useState(false);
  const [invalidEmailField, setInvalidEmailField] = useState(false);
  const [emptyPasswordField, setEmptyPasswordField] = useState(false);


  const handleSubmit = (event) => {
    event.preventDefault();

    if(emptyPasswordField||invalidEmailField||emptyEmailField||emptyNameField){
      return
    }
    else{
      setSubmitted(true) 
    }
  };

  function handleChange (event) {
    //validation
    if (event.target.name==="name"){
        if(event.target.value ===""){
          setEmptyNameField(true)
        }else{
          setEmptyNameField(false)
        }
    }
    if(event.target.name==="email"){
      if(event.target.value ===""){
        setEmptyEmailField(true)
      }else{
        if(event.target.value.includes("@")){
          setInvalidEmailField(false)
        }else{
        setInvalidEmailField(true)
        }
       setEmptyEmailField(false)
      }
    }
    if(event.target.name==="password"){
      if(event.target.value ===""){
        setEmptyPasswordField(true)
      }else{
        setEmptyPasswordField(false)
      }
    }
    setSignUpData({
        ...signUpData,
        [event.target.name]: event.target.value
  });
  }


  function setEmailFieldHelperText(){
    if(emptyEmailField){
      return "E-mail field can not be empty."
    }else if (invalidEmailField){
      return "Invalid E-mail!"
    }else{
      return null
    }
  }


  useEffect(() => {
      async function registerUser() {
          //on submit, clean the word with the profanity cleaner package
          //https://www.npmjs.com/package/profanity-cleaner
          const filteredName = await clean(signUpData.name, { keepFirstAndLastChar: true }); 

          fetch(import.meta.env.VITE_BACKEND_URL+'/signup', {
              method: "post",
              body: JSON.stringify({ name: filteredName, email: signUpData.email, password: signUpData.password}), 
              headers: {
                  'Content-Type': 'application/json',
                  "Access-Control-Allow-Origin": "*",
              },
              credentials:"include" //required for sending the cookie data
          })
          .then(async result => {
            if (result.ok) {
              let response = await result.json();
              console.warn(response);
              setSubmitted(false);
              if(response.name==="UserExistsError"){
                setSnackbarOpenCondition("alreadyRegistered")
                setSnackbarOpen(true)
              }else{
                console.log("Successfully registered user!")
                navigate("/"); 
                //reload the page, so it re-fetches the logged in user data
                window.location.reload();
                setSnackbarOpenCondition("successfulRegister")
                setSnackbarOpen(true)
              }
            }else{
              console.error("There has been an error!")
              console.error(result); 
              setSubmitted(false);
            }  
          })
          .catch (error =>{
            console.warn("Error: " + error)
          }) 

      }
      if (submitted ===true){
      registerUser();
      } 
  }, [submitted]);

  return (
  <>
{/*     {currentUser? <Navigate to="/" />
  : ""} */}
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
            error={emptyNameField}
            helperText={emptyNameField? "Name field can not be empty." :null}
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
            error={emptyEmailField || invalidEmailField}
            helperText={setEmailFieldHelperText()}
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
            error={emptyPasswordField}
            helperText={emptyPasswordField? "Password field can not be empty." :null}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          
          <Grid container className="loginSignupLinkContainer">
            <Grid item>
              <RouterLink className="signUpLink" to="/login">
                  {"Already have an account? Sign in"}
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