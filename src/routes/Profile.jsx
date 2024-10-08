/* eslint-disable react/prop-types */
import { useLocation} from "react-router-dom";
import { useState, useContext, useEffect } from 'react'
import { UserContext, AppStatesContext} from '../App.jsx';
import { CircularProgress, Alert } from '@mui/material';
import "../styles/Profile.css"
import UserCardProfile from "../components/UserCardProfile.jsx";
import AllPostsDisplay from '../components/AllPostsDisplay.jsx';
//import for generating the url path for routing 




const Profile = () => {

  // Pass the UserContext defined in app.js
  const {selectedUser, setSelectedUser } = useContext(UserContext); 
  const {pressedFollow} = useContext(AppStatesContext); 
  const [error, setError] = useState(null);
  const [profilePageLoading, setProfilePageLoading] = useState(true);

 
  //get the last 8 characters of current url (which is the assigned shortid for the selectedUser)
  const location = useLocation();
  // Get the pathname from the location object
  const currentPath = location.pathname;
  // Extract the last 8 characters
  const last8Chars = currentPath.slice(-8);


  //make a profile call because the selectedUser state will empty once the user refreshes the page
  //fetch for getting data of the user, based on their shortId
  useEffect(() => {
    const getUserData = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/profile-shortId/'+last8Chars, {
      method: 'GET',
      })
      .then(response => {
          if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          setSelectedUser(data[0])
          setProfilePageLoading(false)
      })
      .catch(error => {
          setError(error.message);
          setProfilePageLoading(false)
          console.error('Error:', error);
      });
    };
    getUserData();
    //when user follows/unfollows, refresh display to have either the follow or unfollow button
    }, [pressedFollow]); 








  if (profilePageLoading) {
    return <CircularProgress />;
  }



  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  
  return (
    <>
    <div className="profileContainer">
      
      <UserCardProfile/>
      <AllPostsDisplay
      fromThisUser = {selectedUser} //instead of displaying all posts, display the posts only from this user
      />


    </div>
    </>


  );
};


export default Profile;

