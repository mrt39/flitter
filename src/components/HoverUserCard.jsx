/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Avatar, Typography, Box, Button } from '@mui/material';
import { AppStatesContext, UserContext} from '../App.jsx';
import { CircularProgress, Alert } from '@mui/material';
import FollowButton from './FollowButton.jsx';
import '../styles/HoverUserCard.css';

//imports for generating the url path for routing 
import slugify from 'slugify';




const HoverUserCard = ({ user }) => {

  const {currentUser, setSelectedUser} = useContext(UserContext); 
  const {darkModeOn, pressedFollow, setPressedFollow} = useContext(AppStatesContext); 
  const [displayedUserOnCard, setDisplayedUserOnCard] = useState(user)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  //make a profile call because when the user presses the follow button, data on the card needs to change
  //fetch for getting data of the user, based on their shortId
  useEffect(() => {
    const getUserData = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/profile-shortId/'+user.shortId, {
      method: 'GET',
      })
      .then(response => {
          if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          setDisplayedUserOnCard(data[0])
          setLoading(false)
      })
      .catch(error => {
          setError(error.message);
          setLoading(false)
          console.error('Error:', error);
      });
    };
    getUserData();
    //when user follows/unfollows, re-populate the displayedUserOnCard state
    }, [pressedFollow]);



  const navigate = useNavigate(); 

  //handle generating the url path for routing to /profile/:slug
  function handleProfileRouting(clickedOnUser){
      setSelectedUser(clickedOnUser)
      //slugify the username, e.g:"john-doe"
      const slug = slugify(clickedOnUser.name, { lower: true }); 
      //combine slug with usershortID to create the unique profile path for the selected user to route to
      const profilePath = `/profile/${slug}-${clickedOnUser.shortId}`
      //route to the profile path
      navigate(profilePath); 
  }


    //handle generating the url path for routing to /profile/:slug/followers
    function handleFollowersRouting(string){
      //slugify the username, e.g:"john-doe"
      const slug = slugify(displayedUserOnCard.name, { lower: true }); 
      //combine slug with usershortID to create the unique profile path for the selected user to route to
      const profilePath = `/profile/${slug}-${displayedUserOnCard.shortId}/${string}`
      // Route to the profile path
      navigate(profilePath); 
    }



  if (loading) {
    return <CircularProgress />;
  }



  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }


  return (
    <Card
      onClick={(e) => {
        e.preventDefault();
      }}
      sx={{
        width: 270,
        borderRadius: 3,
        boxShadow: darkModeOn 
        ? '0px 0px 8px rgba(255, 255, 255, 0.4)'  // White shadow for dark mode
        : '0px 0px 15px rgba(0, 0, 0, 0.15)',      // Gray shadow for light mode,
        padding: 2,
      }}
      className="userCardonHover"
    >
      {/* Flex container for avatar and follow button */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        {/* link to profile */}
        <span
          className="usernameLinkOnPost"
          onClick={(e) => {
              e.preventDefault();
              handleProfileRouting(displayedUserOnCard);
          }}
        >
          <div className="hoverUserCardAvatarandNameContainer">
            <Avatar
              alt={displayedUserOnCard.name}
              src={displayedUserOnCard.picture ? displayedUserOnCard.picture : displayedUserOnCard.uploadedpic}
              sx={{ width: 56, height: 56, mr: 2 }}
            />
            <Typography variant="h6" fontWeight="bold">
              {displayedUserOnCard.name}
            </Typography>
          </div>
        </span>
        {/* don't display the follow button when the user hovers on their own name */}
        {currentUser.shortId !== displayedUserOnCard.shortId 
        &&
        <FollowButton
          displayedUserOnCard={displayedUserOnCard}
        />
        }
      </Box>

      {/* User's name and bio */}
      <CardContent 
        sx={{
          p: 0,
          '&:last-child': {
            pb: 2, 
          },
        }}
      >
        {/* User Bio */}
        <Typography variant="body2" color="text.primary">
          {displayedUserOnCard.bio}
        </Typography>

        {/* Follower and Following Counts */}
        <Box display="flex" justifyContent="flex-start" gap="50px">
          <Link className="hoverUserCardFollowersLink" onClick={() => handleFollowersRouting("following")}>
            <Typography variant="body2" fontWeight="bold">
              {displayedUserOnCard.followingCount} <span style={{ color: '#657786' }}>Following</span>
            </Typography>
          </Link>
          <Link className="hoverUserCardFollowersLink" onClick={() => handleFollowersRouting("followers")}>
            <Typography variant="body2" fontWeight="bold">
              {displayedUserOnCard.followerCount} <span style={{ color: '#657786' }}>Followers</span>
            </Typography>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HoverUserCard;