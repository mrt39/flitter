/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Avatar } from '@mui/material';
import { CircularProgress, Alert } from '@mui/material';
import "../styles/Profile.css"
//imports for generating the url path for routing 
import slugify from 'slugify';



const UserCardProfile = ({currentUser, selectedUser, setSelectedUser, pressedFollow, setPressedFollow}) => {


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
    setLoading(true)
    setPressedFollow(true);
  }
  

  //useEffect for handling follow
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
            console.log("Followed/Unfollowed Succesfully!")
            setPressedFollow(false)
            setLoading(false)
          } else{
            throw new Error(result)
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setPressedFollow(false)
          setLoading(false)
        }); 
      }
      //only trigger when followed
      if (pressedFollow ===true){
        followUser();
      } 
    }, [pressedFollow]);




   
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
                disabled={loading? true : false}
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
