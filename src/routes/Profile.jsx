/* eslint-disable react/prop-types */
import { useOutletContext, useLocation} from "react-router-dom";
import { useState, useContext, useEffect } from 'react'
import { UserContext } from '../App.jsx';
import { CircularProgress, Alert } from '@mui/material';
import "../styles/Profile.css"
import UserCardProfile from "../components/UserCardProfile.jsx";
import PostsDisplay from '../components/PostsDisplay.jsx';
//import for generating the url path for routing 




const Profile = () => {

  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated, allPosts, setAllPosts, handleLike, pressedLikePost, imgSubmitted, setImgSubmitted, pressedSubmitPost, setPressedSubmitPost ] = useOutletContext();
  // Pass the UserContext defined in app.jsx
  const { currentUser, selectedUser, setSelectedUser } = useContext(UserContext); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pressedFollow, setPressedFollow] = useState(false)




  //get the last 8 characters of current url (which is the assigned shortid for the selectedUser)
  const location = useLocation();
  // Get the pathname from the location object
  const currentPath = location.pathname;
  // Extract the last 8 characters
  const last8Chars = currentPath.slice(-8);


  //need to make a profile call because the selectedUser state will empty once the user refreshes the page
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

          setLoading(false)
      })
      .catch(error => {
          setError(error.message);
          setLoading(false)
          console.error('Error:', error);
      });
    };
    getUserData();
    //when user follows/unfollows, this refreshes to display either the follow or unfollow button
    }, [pressedFollow]);







  if (loading) {
    return <CircularProgress />;
  }



  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  
  return (
    <>
    <div className="profileContainer">
      
      <UserCardProfile
      currentUser = {currentUser}
      selectedUser = {selectedUser}
      setSelectedUser = {setSelectedUser}
      pressedFollow = {pressedFollow}
      setPressedFollow = {setPressedFollow}
      />

    <br /><br /> <br /><br /> <br /><br />
    <PostsDisplay
      allPosts = {allPosts}
      setSelectedUser = {setSelectedUser}
      handleLike = {handleLike}
      fromThisUser = {selectedUser} //instead of displaying all posts, display the posts only from this user
      />


    </div>
    </>


  );
};


export default Profile;

