/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { CircularProgress, Alert } from '@mui/material';
import UserCardProfile from "../components/UserCardProfile.jsx";
import AllPostsDisplay from '../components/AllPostsDisplay.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { usePost } from '../contexts/PostContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useFollow } from '../contexts/FollowContext.jsx';
import { getUserByShortId } from '../utilities/authService.js';
import "../styles/Profile.css"

const Profile = () => {
  //use context hooks
  const { selectedUser, setSelectedUser } = useUser(); 
  const { setActiveTab, setSearchWord } = usePost(); 
  const { pressedFollow, userRefreshPending } = useFollow(); 
  const { profileUpdated } = useAuth();

  
  const [error, setError] = useState(null);
  const [profilePageLoading, setProfilePageLoading] = useState(true);
 
  //get the last 8 characters of current url (which is the assigned shortid for the selectedUser)
  const location = useLocation();
  // Get the pathname from the location object
  const currentPath = location.pathname;
  // Extract the last 8 characters
  const last8Chars = currentPath.slice(-8);

  //when the /profile route is accessed, set the active tab to "forYou" and set searchWord to null, in order to display the correct posts on user's profile
  useEffect(() => {
    setActiveTab("forYou");
    setSearchWord(null);
  },[]);

  //make a profile call because the selectedUser state will empty once the user refreshes the page
  //fetch for getting data of the user, based on their shortId
  useEffect(() => {
    const getUserData = () => {
      getUserByShortId(last8Chars)
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
    //when user follows/unfollows (which changes the state of userRefreshPending), refresh display to have either the follow or unfollow button
  }, [userRefreshPending, profileUpdated]); 

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