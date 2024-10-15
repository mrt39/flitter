import { Outlet } from "react-router-dom";
import SidebarRight from "./components/SidebarRight.jsx"
import SidebarLeft from "./components/SidebarLeft.jsx"
import Snackbar from "./components/Snackbar.jsx"
import './styles/App.css'
import { useEffect, useState, createContext, useRef} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import { CircularProgress, Alert } from '@mui/material';
import slugify from 'slugify';


//----------------------MUI DARK THEME---------------------------
//MUI DARK THEME
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
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

/*   const [theme, setTheme] = useState(savedTheme);
 */


  //----------------------MUI DARK THEME---------------------------
    //load the theme from localstorage so that the user selection persists. use dark theme as default.
    const savedTheme = localStorage.getItem('darkModeOn') || 'true';

    // Parse saved theme value as a boolean. Default to true (dark mode) if no value is found.
    const [darkModeOn, setDarkModeOn] = useState(savedTheme === 'true');

    // Function to toggle the dark mode
    const toggleDarkTheme = () => {
      setDarkModeOn(prevDarkModeOn => {
        const newTheme = !prevDarkModeOn;
        localStorage.setItem('darkModeOn', newTheme); // Store new value in localStorage
        return newTheme;
      });
    };
  
    // applying the primary and secondary theme colors
    const darkTheme = createTheme({
      palette: {
        mode: darkModeOn ? 'dark' : 'light', 
        primary: {
          main: '#90caf9',
        },
        secondary: {
          main: '#131052',
        },
        background: {
          default: darkModeOn ? 'black' : '#fff', // change default background color for dark mode
        },
        text: {
          primary: darkModeOn ? 'rgb(231, 233, 234)' : 'rgb(15, 20, 25)',
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                // background color change for user's profile display button at the bottom of the sidebar
                backgroundColor: darkModeOn ? '#333' : '#ddd',
              },
            },
          },
        },
      },
    });

  //----------------------MUI DARK THEME END---------------------------

  const [currentUser, setCurrentUser] = useState(null);
  //selected user for displaying their profile
  const [selectedUser, setSelectedUser] = useState();
  //storing all users
  const [allUsers, setAllUsers] = useState();

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
  //refresh posts in the event of like, comment or sending a new post
  const [refreshPosts, setRefreshPosts] = useState(false);

  // active tab in the HomePageTopSection component, to pass onto the AllPostsDisplay's components to filter posts
  const [activeTab, setActiveTab] = useState('forYou');

  //state for most iterated words in the posts, to display in the "What's happening" section
  const [mostIteratedWords, setMostIteratedWords] = useState(null);
  //state for the search word that gets set when the user clicks on a word in the "What's happening" section
  const [searchWord, setSearchWord] = useState(null);

  //toggle for pressing the follow button
  const [pressedFollow, setPressedFollow] = useState(false)



  //user presses "send" after selecting the image
  //use two different states for navbar form and homepage form, as otherwise they clash while posting
  const [imgSubmittedNavbar, setImgSubmittedNavbar] = useState(false);
  const [imgSubmittedHomePage, setImgSubmittedHomePage] = useState(false);
  //seperate the conditional "send a post" states for the navbar submit form and homepage submit form, so that submitting from one doesn't trigger the other
  const [pressedSubmitPost, setPressedSubmitPost] = useState(false)

  const [isSubmittingPost, setisSubmittingPost] = useState(false); // Track if a submission is already in progress, disable all submit buttons

  const appContainerRef = useRef(null); // Add a reference to the outlet container

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



  const navigate = useNavigate();

  //handle generating the url path for routing to /profile/:slug
  function handleProfileRouting(clickedOnUser){
    setSelectedUser(clickedOnUser)
    //slugify the username, e.g:"john-doe"
    const slug = slugify(clickedOnUser.name, { lower: true }); 
    //combine slug with usershortID to create the unique profile path for the selected user to route to
    const profilePath = `/profile/${slug}-${clickedOnUser.shortId}`
    // Route to the profile path
    navigate(profilePath); 
}

  //FOLLOW STATES AND LOGIC. 
  //Defining the states and logic here, as the follow button is used in multiple components
  //also, the follow button is used in the UserCardProfile component, which is a child of the HoverUserCard component that gets displayed as a tooltip when hovering over a user's profile picture. 
  //sending a post request within the tooltip and it's child components disrupts the display of the tooltip and/or the follow logic, so the follow logic is defined here to prevent that.
  const [usertoFollow, setUsertoFollow] = useState()
  const [loadingFollow, setLoadingFollow] = useState(false)

  //useEffect for handling follow
  useEffect(() => {
    async function followUser() { 
      await fetch(import.meta.env.VITE_BACKEND_URL+'/followUser', {
        method: "post",
        body: JSON.stringify({ fromUser: currentUser, toUser: usertoFollow}), 
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
        credentials:"include" //required for sending the cookie data-authorization check
    })
      .then(async result => {
        if (result.ok){
          await result.json();
          console.log("Followed/Unfollowed Succesfully!")
          setPressedFollow(false)
          setLoadingFollow(false)
        } else{
          throw new Error(result)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setPressedFollow(false)
        setLoadingFollow(false)
      }); 
    }
  // Only trigger when pressedFollow is true and loading is true
    if (pressedFollow && loadingFollow){
      followUser();
    } 
  }, [pressedFollow, loadingFollow]);

  

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

    //add referance to the app container to determine the scrollable target for the infinite scroll
    <div className='appContainer' ref={appContainerRef}>

      {/* mui theme provider */}
      <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <AppStatesContext.Provider value={{ 
          allPosts, setAllPosts, snackbarOpen, setSnackbarOpen, 
          snackbarOpenCondition, setSnackbarOpenCondition, 
          profileUpdated, setProfileUpdated, imgSubmittedNavbar, setImgSubmittedNavbar,
          imgSubmittedHomePage, setImgSubmittedHomePage, isSubmittingPost, 
          setisSubmittingPost, pressedSubmitPost, setPressedSubmitPost,
          refreshPosts, setRefreshPosts, darkModeOn, pressedFollow, setPressedFollow,
          toggleDarkTheme, usertoFollow, setUsertoFollow, loadingFollow, setLoadingFollow,
          appContainerRef, mostIteratedWords, setMostIteratedWords, searchWord, setSearchWord,
          activeTab, setActiveTab, handleProfileRouting
      }}>
        <UserContext.Provider value={{ currentUser, setCurrentUser, selectedUser, setSelectedUser}}>

        <Snackbar
          snackbarOpenCondition={snackbarOpenCondition}
          snackbarOpen={snackbarOpen}
          setSnackbarOpen={setSnackbarOpen}
        />


        {currentUser ? 
        <>
          <SidebarLeft/>
          <div className="outletContainer" >
            <Outlet /> 
          </div>
          <SidebarRight/>
        </>
        : //if not logged in, only render outlet and navigate to /login
        <>
          <Outlet />
          <Navigate to="/login" /> 
        </>} 

        </UserContext.Provider>

      </AppStatesContext.Provider>

      </ThemeProvider>

    </div>

  );
};

export default App;


