import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx"
import ThemeButton from "./components/ThemeButton.jsx"
import './styles/App.css'
import { useEffect, useState, createContext} from "react";
import { Navigate, } from "react-router-dom";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

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

export const UserContext = createContext({
  selectedUser: (null),
  currentUser: (null),
  setSelectedUser: () => {},
});



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
  const [loading, setLoading] = useState(true);
  //first time loading
  const [firstTimeLoading, setFirstTimeLoading] = useState(true);
  //state that turns true whenever user updates their profile from the /profile route
  const [profileUpdated, setProfileUpdated] = useState(false);

  //snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarOpenCondition, setSnackbarOpenCondition] = useState();

  //all posts
  const [allPosts, setAllPosts] = useState([]);




  //handle liking the posts
  const [likepostID, setLikePostID] = useState("")
  const [pressedLikePost, setPressedLikePost] = useState(false)

  function handleLike(postID){
    setLikePostID(postID)
    setPressedLikePost(true)
  }

   //useffect for liking posts
   useEffect(() => {
    async function likePost() {
      await fetch(import.meta.env.VITE_BACKEND_URL+'/likePost', {
        method: "PATCH",
        // storing date as isostring to make the reading easier later
        body: JSON.stringify({ postID: likepostID, likedBy: currentUser}), 
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
        credentials:"include" //required for sending the cookie data-authorization check
    })
      .then(async result => {
        if (result.ok){
          await result.json();
          console.log("Liked Post!")
          setPressedLikePost(false)
        } else{
          throw new Error(result)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setPressedLikePost(false)
      }); 
    }
    //only trigger when comment is posted
    if (pressedLikePost ===true){
      likePost();
    } 
  }, [pressedLikePost]);



  /* get the user data when logged in, also checks if the user is logged in after each refresh*/
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


  // change the user data from the stored user data in the session, to the actual user data in the db 
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

          {currentUser ? 
          <Navbar 
          user={currentUser} 
          setCurrentUser={setCurrentUser}
          />
          : <Navigate to="/login" /> } 
          <UserContext.Provider value={{ currentUser, selectedUser, setSelectedUser, theme }}>
            {/* "context" is how you pass props to Outlet: https://reactrouter.com/en/main/hooks/use-outlet-context */}
            <Outlet  context={[snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated, allPosts, setAllPosts, handleLike]} /> 
          </UserContext.Provider>
      </ThemeProvider>

      </div>


  );
};

export default App;
