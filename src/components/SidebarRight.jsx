/* eslint-disable react/prop-types */
import {useState } from 'react';
import { Box, CircularProgress} from '@mui/material';
import WhotoFollow from './WhotoFollow.jsx';
import WhatsHappening from './WhatsHappening.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import '../styles/SidebarRight.css';




const SidebarRight = () => {

  const {darkModeOn} = useUI();
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
        <WhatsHappening/>
        <WhotoFollow/>
        </div>
      </div>

   
  );
}

export default SidebarRight

