/* eslint-disable react/prop-types */
import { useOutletContext} from "react-router-dom";
import { useState, useContext, useEffect } from 'react'
import { UserContext } from '../App.jsx';
import React from 'react';
import { Card, CardContent, Typography, Button, Avatar } from '@mui/material';
import "../styles/Profile.css"



import ShortUniqueId from 'short-unique-id';




const Profile = () => {

  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated] = useOutletContext();
  // Pass the UserContext defined in app.jsx
  const { currentUser, selectedUser, setSelectedUser } = useContext(UserContext); 

    //need to make a profile call because the selectedUser state will empty once the user refreshes the page
    //fetch for getting data of the user
/*     useEffect(() => {
      const getMessages = () => {
        fetch(import.meta.env.VITE_BACKEND_URL+'/profile/'+selectedUser._id, {
        method: 'GET',
        })
        .then(response => {
            if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            //sort data by dates, descending order
            data.sort((post1,post2) => (post1.date < post2.date) ? 1 : ((post2.date < post1.date) ? -1 : 0))
            console.log(data)
            setAllPosts(data)
            setLoading(false)
        })
        .catch(error => {
            setError(error.message);
            console.error('Error:', error);
            setLoading(false)
        });
      };
      getMessages();
      }, []);  */


      function handleFollow(){
        // Generate a short unique ID
        const { randomUUID } = new ShortUniqueId({ length: 10 });
        const randomShortId= randomUUID(); 
        console.log(randomShortId); 
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

