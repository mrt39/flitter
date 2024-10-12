/* eslint-disable react/prop-types */
import {useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AppStatesContext, UserContext } from '../App.jsx';
import {  Box, CircularProgress, Card, CardContent, Typography, List, ListItem, ListItemAvatar, ListItemText} from '@mui/material';
import '../styles/SidebarRight.css';
import UserAvatar from './UserAvatar.jsx';
import FollowButton from './FollowButton.jsx';

import "../styles/WhotoFollow.css";


//imports for generating the url path for routing 
import slugify from 'slugify';



const WhotoFollow = () => {

  const {pressedFollow /* allUsers, setAllUsers */} = useContext(AppStatesContext); 
  const {currentUser, setSelectedUser} = useContext(UserContext); 

  const [allUsers, setAllUsers] = useState(null);
  //sorted users to display
  const [sortedUsers, setSortedUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [firstrender, setFirstrender] = useState(true);

  const navigate = useNavigate(); 



  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + '/getallusers', {
      method: 'GET',
    })
      .then(response => {
        if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        setAllUsers(data);
        console.log('Fetched users:', data); // Log the fetched data
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
      });
  }, [pressedFollow]);


  useEffect(() => {
    if (allUsers) {
      const whoToFollow = [];
      // Exclude the current user
      const temp = allUsers.filter(user => user.shortId !== currentUser.shortId);

      // Exclude the users the current user is already following
      temp.forEach(user => {
        if (!user.followedbytheseID.includes(currentUser._id)) {
          whoToFollow.push(user);
        }
      });

      // Set three random users to follow
      // do the randomization only on first render and only if there are users to follow
      if (firstrender && whoToFollow.length > 0){
        setSortedUsers(whoToFollow.sort(() => 0.5 - Math.random()).slice(0, 3));
      } else{
        setSortedUsers(whoToFollow.slice(0, 3));
      }
      setFirstrender(false);
    }
  }, [allUsers]);

    //handle generating the url path for routing to /profile/:slug
    function handleProfileRouting(clickedOnUser){
        setSelectedUser(clickedOnUser)
        //slugify the username, e.g:"john-doe"
        const slug = slugify(clickedOnUser.name, { lower: true }); 
        //combine slug with usershortID to create the unique profile path for the selected user to route to
        const profilePath = `/profile/${slug}-${clickedOnUser.shortId}`
        // Route to the profile path
        navigate(profilePath); 
    }   



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
        <CardContent>
          <Typography variant="h6" component="div" className='sidebarRightTitle'>
            Who to follow
          </Typography>
          <List>
          {sortedUsers.map((user) => (
                <ListItem className='whotoFollowListItem' key={user._id}>
                    <span className="usernameLinkOnPost avatarLink" onClick={(e) => {
                        e.preventDefault();
                        handleProfileRouting(user);
                    }}>
                        <ListItemAvatar>
                            <UserAvatar user={user} />
                        </ListItemAvatar>
                    </span>
                    <div className="whotofollow-list-item-content">
                        <span className="usernameLinkOnPost avatarLink" onClick={(e) => {
                            e.preventDefault();
                            handleProfileRouting(user);
                        }}>
                            <ListItemText primary={user.name} />
                        </span>
                        <FollowButton displayedUserOnCard={user}/>
                  </div>
                </ListItem>
            ))}
            {sortedUsers.length === 0 && 
                <Typography variant="body2" component="div" >
                    No users to follow.
                </Typography>
            }
          </List>
        </CardContent>
      </Card>
   
  );
}

export default WhotoFollow;

