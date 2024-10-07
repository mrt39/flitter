/* eslint-disable react/prop-types */
import { useState,  useEffect, useContext } from 'react'
import { UserContext, AppStatesContext } from '../App.jsx';
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Avatar } from '@mui/material';
import "../styles/Profile.css"
//imports for generating the url path for routing 
import slugify from 'slugify';



const UserCardProfile = () => {


  // Pass the UserContext defined in app.jsx
  const {currentUser, selectedUser} = useContext(UserContext); 
  const {pressedFollow, setPressedFollow, loadingFollow, setLoadingFollow, setUsertoFollow} = useContext(AppStatesContext); 



  const [loading, setLoading] = useState(false)


    
   const navigate = useNavigate(); 

  //handle generating the url path for routing to /profile/:slug/followers
  function handleFollowersRouting(string){
    //slugify the username, e.g:"john-doe"
    const slug = slugify(selectedUser.name, { lower: true }); 
    //combine slug with usershortID to create the unique profile path for the selected user to route to
    const profilePath = `/profile/${slug}-${selectedUser.shortId}/${string}`
    // Route to the profile path
    navigate(profilePath); 
  }

    
  function handleFollow(){
    setUsertoFollow(selectedUser)
    setLoadingFollow(true)
    setPressedFollow(true);
  }





   
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
            <Link onClick={() => handleFollowersRouting("followers")}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Followers: {selectedUser.followerCount}
                </Typography>
            </Link>
            <Link onClick={() => handleFollowersRouting("following")}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Following: {selectedUser.followingCount}
                </Typography>
            </Link>
            {/* don't display the follow button if the logged in user is displaying their own profile */}
            {currentUser._id === selectedUser._id
            ? ""
            : 
            <Button
                disabled={loadingFollow}
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

