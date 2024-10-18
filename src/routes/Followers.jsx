/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from 'react'
import { useLocation, Link} from "react-router-dom";
import HoverUserCard from '../components/HoverUserCard.jsx';
import { UserContext, AppStatesContext } from '../App.jsx';
import FollowersTopSection from '../components/FollowersTopSection.jsx'; 
import UserAvatar from '../components/UserAvatar.jsx';
import FollowButton from '../components/FollowButton.jsx';
import { ListItem, ListItemAvatar, ListItemText, Typography, Paper, CircularProgress, Alert, Box, Tooltip } from '@mui/material';

import '../styles/Followers.css';


const Followers = () => {

  // Pass the UserContext defined in app.jsx
  const { currentUser } = useContext(UserContext); 
  const { darkModeOn, pressedFollow, handleProfileRouting, setActiveTab, setSearchWord } = useContext(AppStatesContext); 


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followerData, setFollowerData] = useState({});
  const [currentPathFollowers, setCurrentPathFollowers] = useState({});

  //get the shortid of the user from the current URL
  const location = useLocation();
  //get the pathname from the location object
  const path = location.pathname;
  //extract the last 8 characters
  const shortID = path.slice(-18, -10);

  //when the /followers route is accessed, set the active tab to "forYou" and set searchWord to null, in order to display the correct posts on user's profile
  useEffect(() => {
    setActiveTab("forYou");
    setSearchWord(null);
  },[]);

  //get whether it's /following or /followers path and store it in currentPath state
  //change the currentPath state when the user clicks on the tabs or clicks on "followers" or "following" link on HoverUserCard
  useEffect(() => {
    setCurrentPathFollowers(path.slice(-9));
      }, [location]); 


    

  //fetch for getting the follower data of the user, based on their id
  useEffect(() => {
      const getFollowerData = () => {
          fetch(import.meta.env.VITE_BACKEND_URL+'/followers/'+shortID, {
          method: 'GET',
          })
          .then(response => {
              if (response.ok) {
              return response.json(); 
              }
              throw new Error('Network response was not ok.');
          })
          .then(data => {
              setFollowerData(data[0])
          })
          .catch(error => {
              setError(error.message);
              console.error('Error:', error);
          })
          .finally(() => {
            setLoading(false);
          });
          
      };
      //change followerData state when the user clicks on the profile tab or clicks on "followers" or "following" link on HoverUserCard
      getFollowerData();
      }, [pressedFollow, shortID]); 

  if (loading) {
    return <CircularProgress />;
  }



  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper elevation={3} className="followers-paper" style={{ padding: '20px', maxWidth: '600px', margin: '20px auto' }}>
      <FollowersTopSection
        currentPathFollowers={currentPathFollowers}
        setCurrentPathFollowers={setCurrentPathFollowers}
      />
      {currentPathFollowers === "following"
        ? followerData.following && followerData.following.length > 0
          ? followerData.following.map((follower) => (
            <Link onClick={() => handleProfileRouting(follower)} className={`followers-link ${darkModeOn ? 'dark-mode' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }} key={follower._id}>
              <ListItem className={`followers-listitem ${darkModeOn ? 'dark-mode' : ''}`}  alignItems="flex-start">
                <ListItemAvatar className='followers-avatar'>
                  <UserAvatar user={follower} />
                </ListItemAvatar>
                <ListItemText 
                  className={`followers-listitemtext`}
                  primary={
                    <div className="followers-header">
                      {/* MUI tooltip that will display a user card on hover */}
                      <Tooltip 
                        title={
                            <Box sx={{ minWidth: 280 }}> 
                                <HoverUserCard 
                                  user={follower} 
                                />
                            </Box>
                        }
                        enterDelay={200}
                        leaveDelay={200}
                        placement="bottom"

                        PopperProps={{
                            modifiers: [
                                {
                                    name: 'arrow',
                                    enabled: false, 
                                },
                            ],
                            sx: {
                              '.MuiTooltip-tooltip': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none', 
                                padding: 0, 
                              },
                            },
                        }}        
                      > 
                        <Typography variant="h6" className='followers-name'>{follower.name}</Typography>
                      </Tooltip>
                  </div>
                  }
                  secondary={follower.bio}
                />
                {follower._id!=currentUser._id &&
                <div className="followers-followbutton-container">
                  <FollowButton displayedUserOnCard={follower} />
                </div>
                }
              </ListItem>
            </Link>

          ))
          : <Typography variant="body1" sx={{marginTop:"10px"}}>This user isn't following anyone.</Typography>
          
        : followerData.followedby && followerData.followedby.length > 0
          ? followerData.followedby.map((follower) => (
            <Link onClick={() => handleProfileRouting(follower)} className={`followers-link ${darkModeOn ? 'dark-mode' : ''}`} style={{ textDecoration: 'none', color: 'inherit' }} key={follower._id}>
              <ListItem className={`followers-listitem ${darkModeOn ? 'dark-mode' : ''}`}  alignItems="flex-start">
                <ListItemAvatar className='followers-avatar'>
                  <UserAvatar user={follower} />
                </ListItemAvatar>
                <ListItemText
                  className={`followers-listitemtext`}
                  primary={
                    <div className="followers-header">
                      {/* MUI tooltip that will display a user card on hover */}
                      <Tooltip 
                        title={
                            <Box sx={{ minWidth: 280 }}> 
                                <HoverUserCard 
                                  user={follower} 
                                />
                            </Box>
                        }
                        enterDelay={200}
                        leaveDelay={200}
                        placement="bottom"

                        PopperProps={{
                            modifiers: [
                                {
                                    name: 'arrow',
                                    enabled: false, 
                                },
                            ],
                            sx: {
                              '.MuiTooltip-tooltip': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none', 
                                padding: 0, 
                              },
                            },
                        }}        
                      > 
                        <Typography variant="h6" className='followers-name'>{follower.name}</Typography>
                      </Tooltip>
                  </div>
                  }
                  secondary={follower.bio}
                />
                {follower._id!=currentUser._id &&
                <div className="followers-followbutton-container">
                  <FollowButton displayedUserOnCard={follower} />
                </div>
                }
              </ListItem>
            </Link>
          ))
          : <Typography variant="body1" sx={{marginTop:"10px"}}>This user isn't followed by anyone.</Typography>
      }
    </Paper>
  );
};


export default Followers;