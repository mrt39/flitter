/* eslint-disable react/prop-types */
import { useOutletContext, useLocation} from "react-router-dom";
import { useState, useContext, useEffect } from 'react'
import { UserContext } from '../App.jsx';
import React from 'react';
import { Card, CardContent, Typography, Button, Avatar } from '@mui/material';
import { CircularProgress, Alert } from '@mui/material';
import "../styles/Profile.css"



import ShortUniqueId from 'short-unique-id';




const Profile = () => {

  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated] = useOutletContext();
  // Pass the UserContext defined in app.jsx
  const { currentUser, selectedUser, setSelectedUser } = useContext(UserContext); 

  const [loading, setLoading] = useState(true);
  const [pressedFollow, setPressedFollow] = useState(false)
  const [error, setError] = useState(null);

  //get the last 8 characters of current url (which is the assigned shortid for the selectedUser)
  const location = useLocation();
  // Get the pathname from the location object
  const currentPath = location.pathname;
  // Extract the last 8 characters
  const last8Chars = currentPath.slice(-8);

  //need to make a profile call because the selectedUser state will empty once the user refreshes the page
  //fetch for getting data of the user, based on their shortId
  useEffect(() => {
    const getMessages = () => {
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
          console.log(data[0])
          setLoading(false)
      })
      .catch(error => {
          setError(error.message);
          setLoading(false)
          console.error('Error:', error);
      });
    };
    getMessages();
    }, []); 



  //function for handling follow
  function handleFollow(){
    setPressedFollow(true)
  }

  //useEffect for handling follow
    //useeffect to handle submitting blog posts
    useEffect(() => {
      async function followUser() { 
        await fetch(import.meta.env.VITE_BACKEND_URL+'/followUser', {
          method: "post",
          body: JSON.stringify({ fromUser: currentUser, toUser: selectedUser}), 
          headers: {
              'Content-Type': 'application/json',
              "Access-Control-Allow-Origin": "*",
          },
          credentials:"include" //required for sending the cookie data-authorization check
      })
        .then(async result => {
          if (result.ok){
            await result.json();
            console.log("Followed Succesfully!")
            setPressedFollow(false)
          } else{
            throw new Error(result)
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setPressedFollow(false)
        }); 
      }
      //only trigger when comment is posted
      if (pressedFollow ===true){
        followUser();
      } 
    }, [pressedFollow]);






  if (loading) {
    return <CircularProgress />;
  }



  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  
  return (
    <div className="profileContainer">
      <Card sx={{ maxWidth: 345, textAlign: 'center', width: "20rem", height: "20%", marginTop: "2rem" }}>
        <Avatar
          alt={selectedUser.name}
          src={selectedUser.picture? selectedUser.picture : selectedUser.uploadedpic}
          sx={{ width: 80, height: 80, margin: 'auto', mt: 2 }}
        />
        <CardContent>
          <Typography variant="h5" component="div">
            {selectedUser.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {selectedUser.bio}
          </Typography>
          {/* don't display the follow button if the logged in user is displaying their own profile */}
          {currentUser._id === selectedUser._id
          ? ""
          : 
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleFollow}
          >
            Follow
          </Button>
          }
        </CardContent>
      </Card>
    </div>


  );
};


export default Profile;

