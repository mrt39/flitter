/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Avatar, Typography, Box, useTheme } from '@mui/material';
import { AppStatesContext, UserContext} from '../App.jsx';
import { CircularProgress, Alert } from '@mui/material';
import FollowButton from './FollowButton.jsx';
import UserAvatar from './UserAvatar.jsx';
import '../styles/HoverUserCard.css';

//imports for generating the url path for routing 
import slugify from 'slugify';




const HoverUserCard = ({ user, handleTooltipClose}) => {

  const {currentUser, setSelectedUser} = useContext(UserContext); 
  const {darkModeOn, pressedFollow, handleProfileRouting} = useContext(AppStatesContext); 
  const [displayedUserOnCard, setDisplayedUserOnCard] = useState(user)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();



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
        ? '0px 0px 8px rgba(255, 255, 255, 0.4)'  // white shadow for dark mode
        : '0px 0px 15px rgba(0, 0, 0, 0.15)',      // gray shadow for light mode,
        padding: 2,
      }}
      className={`userCardonHover ${darkModeOn ? 'dark-mode' : ''}`}
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
            <UserAvatar
              user={displayedUserOnCard}
              source="hoverUserCard"
            />
            <Typography variant="h6" fontWeight="bold" className="hoverUserCard-username">
              {displayedUserOnCard.name}
            </Typography>
          </div>
        </span>
        {/* don't display the follow button when the user hovers on their own name */}
        {currentUser.shortId !== displayedUserOnCard.shortId 
        &&
          <FollowButton
            displayedUserOnCard={displayedUserOnCard}
            handleTooltipClose={handleTooltipClose}
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
        <Typography variant="body2" className={`userBio ${darkModeOn ? 'dark-mode' : ''}`}>
          {displayedUserOnCard.bio}
        </Typography>

        {/* Follower and Following Counts */}
        <Box display="flex" justifyContent="flex-start" gap="50px">
          <Link className="hoverUserCardFollowersLink" onClick={() => handleFollowersRouting("following")}>
            <Typography variant="body2" color="text.secondary">
                <span className='userCardFollowerNumber' style={{ color: theme.palette.text.primary}}>
                  {displayedUserOnCard.followingCount}
                </span>&#8203; Following  {/* arrange space between the number and the "Following text" */}
            </Typography>
          </Link>
          <Link className="hoverUserCardFollowersLink" onClick={() => handleFollowersRouting("followers")}>
            <Typography variant="body2" color="text.secondary">
              <span className='userCardFollowerNumber' style={{ color: theme.palette.text.primary}}>
                {displayedUserOnCard.followerCount}
              </span>&#8203; Followers
            </Typography>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HoverUserCard;