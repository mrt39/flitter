/* eslint-disable react/prop-types */
import {useContext, useEffect, useState } from 'react';
import { AppStatesContext, UserContext } from '../App.jsx';
import { IconButton, Box, CircularProgress, Card, CardContent, Typography, Avatar, Button, List, ListItem, ListItemAvatar, ListItemText} from '@mui/material';
import Brightness2Icon from '@mui/icons-material/Brightness2'; 
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import '../styles/SidebarRight.css';
import UserAvatar from './UserAvatar.jsx';
import WhotoFollow from './WhotoFollow.jsx';



const SidebarRight = () => {

  const {darkModeOn, toggleDarkTheme, /* allUsers, setAllUsers */} = useContext(AppStatesContext); 
  const {currentUser} = useContext(UserContext); 

  const [loading, setLoading] = useState(false);


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
    <div className={`sidebarRight ${darkModeOn ? 'dark-mode' : ''}`}>

      <Card className='sidebarRight-section-card sidebarRight-toggleTheme-card'>
        <CardContent>
          <IconButton onClick={toggleDarkTheme} edge="end">
            {darkModeOn ? (
              <WbSunnyIcon sx={{ fontSize: 30, color: '#1da1f2' }} />
            ) : (
              <Brightness2Icon sx={{ fontSize: 30, color: '#1da1f2' }} />
            )}
          </IconButton>
        </CardContent>
      </Card>
      {/* What's happening section */}
      <Card className="sidebarRight-section-card">
        <CardContent>
          <Typography variant="h6" component="div" className='sidebarRightTitle'>
            What&apos;s happening
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Event 1" secondary="Description of event 1" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Event 2" secondary="Description of event 2" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Event 3" secondary="Description of event 3" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

        <WhotoFollow/>
      </div>

   
  );
}

export default SidebarRight

