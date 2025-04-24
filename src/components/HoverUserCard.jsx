/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Box, useTheme, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { useFollow } from '../contexts/FollowContext.jsx';
import { getUserByShortId } from '../utilities/authService.js';
import { createFollowersRoute } from '../utilities/routingUtils.js';
import FollowButton from './FollowButton.jsx';
import UserAvatar from './UserAvatar.jsx';
import '../styles/HoverUserCard.css';

const HoverUserCard = ({ user, handleTooltipClose }) => {
  const { currentUser } = useAuth();
  const { darkModeOn } = useUI();
  const { handleProfileRouting } = useUser();
  const { pressedFollow } = useFollow();
  
  const [displayedUserOnCard, setDisplayedUserOnCard] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const navigate = useNavigate();

  //make a profile call to populate because when the user presses the follow button, data on the card needs to change
  //fetch for getting data of the user, based on their shortId
  useEffect(() => {
    const getUserData = async () => {
      try {
        const data = await getUserByShortId(user.shortId);
        setDisplayedUserOnCard(data[0]);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        console.error('Error:', error);
      }
    };
    getUserData();
    //when user follows/unfollows, re-populate the displayedUserOnCard state
  }, [pressedFollow]);

  //handle generating the url path for routing to /profile/:slug/followers
  function handleFollowersRouting(string) {
    const profilePath = createFollowersRoute(displayedUserOnCard, string);
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
              e.stopPropagation();
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
        {currentUser.shortId !== displayedUserOnCard.shortId && 
          <FollowButton
            displayedUserOnCard={displayedUserOnCard}
            handleTooltipClose={handleTooltipClose}
          />
        }
      </Box>

      {/*user's name and bio */}
      <CardContent 
        sx={{
          p: 0,
          '&:last-child': {
            pb: 2, 
          },
        }}
      >
        {/*user Bio */}
        <Typography variant="body2" className={`userBio ${darkModeOn ? 'dark-mode' : ''}`}>
          {displayedUserOnCard.bio}
        </Typography>

        {/*follower and following Counts */}
        <Box display="flex" justifyContent="flex-start" gap="50px">
          <Link className="hoverUserCardFollowersLink" onClick={(e) => {e.preventDefault(); e.stopPropagation(); handleFollowersRouting("following")}}>
            <Typography variant="body2" color="text.secondary">
                <span className='userCardFollowerNumber' style={{ color: theme.palette.text.primary}}>
                  {displayedUserOnCard.followingCount}
                </span>&#8203; Following  {/* arrange space between the number and the "Following text" */}
            </Typography>
          </Link>
          <Link className="hoverUserCardFollowersLink" onClick={(e) => {e.preventDefault(); e.stopPropagation(); handleFollowersRouting("followers")}}>
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