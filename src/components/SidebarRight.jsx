/* eslint-disable react/prop-types */
import {useContext } from 'react';
import { AppStatesContext } from '../App.jsx';
import { IconButton, Card, CardContent, Typography, Avatar, Button, List, ListItem, ListItemAvatar, ListItemText, AppBar, Toolbar } from '@mui/material';
import Brightness2Icon from '@mui/icons-material/Brightness2'; 
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import '../styles/SidebarRight.css';




const SidebarRight = () => {

  const {darkModeOn, toggleDarkTheme} = useContext(AppStatesContext); 


   


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
            What's happening
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

      {/* Who to follow section */}
      <Card className="sidebarRight-section-card">
        <CardContent>
          <Typography variant="h6" component="div" className='sidebarRightTitle'>
            Who to follow
          </Typography>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar alt="User 1" src="dummy-profile-pic.jpg" />
              </ListItemAvatar>
              <ListItemText primary="User 1" />
              <Button variant="contained" color="primary" size="small">Follow</Button>
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar alt="User 2" src="dummy-profile-pic.jpg" />
              </ListItemAvatar>
              <ListItemText primary="User 2" />
              <Button variant="contained" color="primary" size="small">Follow</Button>
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar alt="User 3" src="dummy-profile-pic.jpg" />
              </ListItemAvatar>
              <ListItemText primary="User 3" />
              <Button variant="contained" color="primary" size="small">Follow</Button>
            </ListItem>
          </List>
        </CardContent>
      </Card>
      </div>

   
  );
}

export default SidebarRight

