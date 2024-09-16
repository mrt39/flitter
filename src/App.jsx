import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx"
import Sidebar from "./components/Sidebar.jsx"
import ThemeButton from "./components/ThemeButton.jsx"
import Snackbar from "./components/Snackbar.jsx"
import './styles/App.css'
import { useEffect, useState, createContext} from "react";
import { Navigate, } from "react-router-dom";
import Box from '@mui/material/Box';
import { CircularProgress, Alert } from '@mui/material';



/* //bootstrap styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import 'bootstrap/dist/js/bootstrap.bundle.min.js';




// context created for theme (dark/light) 
export const ThemeContext = createContext(); */
//----------------------MUI DARK THEME---------------------------
//MUI DARK THEME
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {Switch} from "@mui/material"
//----------------------MUI DARK THEME END---------------------------


//context for carrying user related states
export const UserContext = createContext({
  currentUser: (null),
  setCurrentUser: () => {},
  selectedUser: (null),
  setSelectedUser: () => {},
});

//context for carrying all the other app states 
export const AppStatesContext = createContext();



const App = () => {

  //theme (dark/light)
  //load the theme from localstorage so that the user selection persists. use light theme as default.
  const savedTheme = localStorage.getItem('theme') || 'light';

  const [theme, setTheme] = useState(savedTheme);




  //----------------------MUI DARK THEME---------------------------
    // state to manage the dark mode
    const [toggleDarkMode, setToggleDarkMode] = useState(true);

    // function to toggle the dark mode as true or false
    const toggleDarkTheme = () => {
      setToggleDarkMode(!toggleDarkMode);
    };
  
    // applying the primary and secondary theme colors
    const darkTheme = createTheme({
      palette: {
        mode: toggleDarkMode ? 'dark' : 'light', 
        primary: {
          main: '#90caf9',
        },
        secondary: {
          main: '#131052',
        },
      },
    });

  //----------------------MUI DARK THEME END---------------------------

  const [currentUser, setCurrentUser] = useState(null);
  //selected user for displaying their profile
  const [selectedUser, setSelectedUser] = useState();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  //first time loading
  const [firstTimeLoading, setFirstTimeLoading] = useState(true);
  //state that turns true whenever user updates their profile from the /profile route
  const [profileUpdated, setProfileUpdated] = useState(false);

  //snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarOpenCondition, setSnackbarOpenCondition] = useState("");

  //all posts
  const [allPosts, setAllPosts] = useState([]);




  //user presses "send" after selecting the image
  //use two different states for navbar form and homepage form, as otherwise they clash while posting
  const [imgSubmittedNavbar, setImgSubmittedNavbar] = useState(false);
  const [imgSubmittedHomePage, setImgSubmittedHomePage] = useState(false);
  //seperate the conditional "send a post" states for the navbar submit form and homepage submit form, so that submitting from one doesn't trigger the other
  const [pressedSubmitPost, setPressedSubmitPost] = useState(false)

  const [isSubmittingPost, setisSubmittingPost] = useState(false); // Track if a submission is already in progress, disable all submit buttons


  // get the user data when logged in, also checks if the user is logged in after each refresh
  useEffect(() => {
    const getUser = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/login/success', {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then(response => {
          if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          setCurrentUser(data)
          setLoading(false); // Set loading to false once the data is received
          setFirstTimeLoading(false);
        })
        .catch(error => {
            setLoading(false); // Set loading to false once the data is received
            console.error('Error:', error)});
    };
    //only call when it's the first time loading
    if(firstTimeLoading){
    getUser();
    }
  }, []); 


  //upon user editing their profile, change the user data from the stored user data in the session, to the actual user data in the db 
  useEffect(() => {
    const getUserOnUpdate = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/profile/' + currentUser["_id"], {
        method: 'GET',
      })
        .then(response => {
          if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          setCurrentUser(data[0])
          setLoading(false); // Set loading to false once the data is received
          setProfileUpdated(false)
        })
        .catch(error => {
          setLoading(false); // Set loading to false once the data is received
          console.error('Error:', error)});
          setProfileUpdated(false)
    };
  // only call after the first fetch request is complete 
    if(firstTimeLoading===false){
    getUserOnUpdate();
    }
  // when first fetch is complete or profile is updated, update the currentUser state 
  }, [profileUpdated, firstTimeLoading]); 








  

  if (loading) {
    return (
      <div className='circularProgressContainer'>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size="5rem" />
        </Box>
      </div>
    )
  }

  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (

    <div className='appContainer'>
      <ThemeButton
        theme={theme}
        setTheme={setTheme}
      />

      {/* ---------------------------------- MUI DARK THEME START ---------------------------------- */}
      <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>Toggle Dark mode</h2>
        <Switch checked={toggleDarkMode} onChange={toggleDarkTheme} />
      </div>

      {/* ---------------------------------- MUI DARK THEME END ---------------------------------- */}

      <AppStatesContext.Provider value={{ 
          allPosts, setAllPosts, snackbarOpen, setSnackbarOpen, 
          snackbarOpenCondition, setSnackbarOpenCondition, 
          profileUpdated, setProfileUpdated, imgSubmittedNavbar, setImgSubmittedNavbar,
          imgSubmittedHomePage, setImgSubmittedHomePage, isSubmittingPost, 
          setisSubmittingPost, pressedSubmitPost, setPressedSubmitPost
      }}>

        <Snackbar
          snackbarOpenCondition={snackbarOpenCondition}
          snackbarOpen={snackbarOpen}
          setSnackbarOpen={setSnackbarOpen}
        />



        {currentUser ? 
            <Sidebar
            user={currentUser} 
            setCurrentUser={setCurrentUser}
          />
        : <Navigate to="/login" /> } 

        <UserContext.Provider value={{ currentUser, setCurrentUser, selectedUser, setSelectedUser}}>
          <Outlet /> 
        </UserContext.Provider>

      </AppStatesContext.Provider>

      </ThemeProvider>

    </div>


  );
};

export default App;
