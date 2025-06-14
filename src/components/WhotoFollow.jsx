/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import HoverUserCard from './HoverUserCard.jsx';
import { Box, CircularProgress, Card, CardContent, Typography, List, ListItem, ListItemAvatar, ListItemText, Tooltip} from '@mui/material';
import { useUI } from '../contexts/UIContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { getAllUsers } from '../utilities/userService.js';
import UserAvatar from './UserAvatar.jsx';
import FollowButton from './FollowButton.jsx';
import LinkWrapper from './LinkWrapper.jsx';
import { createProfileRoute } from '../utilities/routingUtils.js';

import "../styles/WhotoFollow.css";

const WhotoFollow = () => {
  //use context hooks
  const { darkModeOn } = useUI();
  const { currentUser } = useAuth(); 
  const { handleProfileRouting } = useUser();

  const [allUsers, setAllUsers] = useState(null);
  //store the sorted users to display
  const [sortedUsers, setSortedUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [firstrender, setFirstrender] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then(data => {
        setAllUsers(data);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
      });
  }, []);

  useEffect(() => {
    if (allUsers) {
      const whoToFollow = [];
      //exclude the current user
      const temp = allUsers.filter(user => user.shortId !== currentUser.shortId);

      //exclude the users the current user is already following
      temp.forEach(user => {
        if (!user.followedbytheseID.includes(currentUser._id)) {
          whoToFollow.push(user);
        }
      });

      //set three random users to follow
      //do the randomization only on first render and only if there are users to follow
      if (firstrender && whoToFollow.length > 0){
        setSortedUsers(whoToFollow.sort(() => 0.5 - Math.random()).slice(0, 3));
      } else{
        setSortedUsers(whoToFollow.slice(0, 3));
      }
      setFirstrender(false);
    }
  }, [allUsers]);

  if (loading) {
    return (
      <div className='circularProgressContainer'>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size="5rem" />
        </Box>
      </div>
    )
  }

  return (
    <Card className="sidebarRight-section-card">
      <CardContent className="sidebarRight-section-cardContent">
        <Typography variant="h6" component="div" className='sidebarRightTitle'>
          Who to follow
        </Typography>
        <List>
        {sortedUsers.map((user) => (
          <LinkWrapper 
            to={createProfileRoute(user)}
            onClick={() => handleProfileRouting(user)} 
            className={`followers-link ${darkModeOn ? 'dark-mode' : ''}`} 
            style={{ textDecoration: 'none', color: 'inherit' }} 
            key={user._id}
          >
            <ListItem className={`whotoFollowListItem ${darkModeOn ? 'dark-mode' : ''}`} key={user._id}>
              <ListItemAvatar>
                <UserAvatar user={user} />
              </ListItemAvatar>
              
              <div className="whotofollow-list-item-content">
                <ListItemText 
                className='whotofollow-listitemtext'
                  primary={
                    <div className="whotofollow-header">
                      {/* MUI tooltip that will display a user card on hover */}
                      <Tooltip 
                        title={
                          <Box sx={{ minWidth: 280 }}> 
                            <HoverUserCard user={user} />
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
                        <Typography variant="h6" className='whotofollow-name'>{user.name}</Typography>
                      </Tooltip>
                    </div>
                  }
                />

                <FollowButton displayedUserOnCard={user}/>
              </div>
            </ListItem>
          </LinkWrapper>
        ))}
        {sortedUsers.length === 0 && 
          <Typography variant="body2" className='noUsersToFollow-text' component="div" >
            No users to follow.
          </Typography>
        }
        </List>
      </CardContent>
    </Card>
  );
}

export default WhotoFollow;