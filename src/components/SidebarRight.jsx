/* eslint-disable react/prop-types */
import {useContext, useState } from 'react';
import { AppStatesContext } from '../App.jsx';
import { IconButton, Box, CircularProgress, Card, CardContent} from '@mui/material';
import Brightness2Icon from '@mui/icons-material/Brightness2'; 
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WhotoFollow from './WhotoFollow.jsx';
import WhatsHappening from './WhatsHappening.jsx';
import '../styles/SidebarRight.css';




const SidebarRight = () => {

  const {darkModeOn, toggleDarkTheme,} = useContext(AppStatesContext); 

  const [loading] = useState(false);


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
    <div className={`sidebarRight-container ${darkModeOn ? 'dark-mode' : ''}`}>
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
        
        <WhatsHappening/>

        <WhotoFollow/>
        </div>
      </div>

   
  );
}

export default SidebarRight

