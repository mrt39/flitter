/* eslint-disable react/prop-types */
import React from 'react';
import { Card, CardContent, Typography, Button, Avatar } from '@mui/material';
import "../styles/Profile.css"




const UserCardProfile = ({currentUser, selectedUser, handleFollow}) => {

   
  return (
    <>
        <Card sx={{ maxWidth: 345, textAlign: 'center', width: "20rem", height: "23%", marginTop: "2rem" }}>
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Followers: {selectedUser.followerCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Following: {selectedUser.followingCount}
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
            {selectedUser.followedbytheseID.includes(currentUser._id)? "Unfollow" : "Follow"}
                
            </Button>
            }
            </CardContent>
        </Card>
    </>
  
  );
};


export default UserCardProfile;

