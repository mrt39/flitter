/* eslint-disable react/prop-types */
import {useContext } from 'react';
import { AppStatesContext } from '../App.jsx';
import '../styles/SidebarRight.css';

import {IconButton} from '@mui/material';
import Brightness2Icon from '@mui/icons-material/Brightness2'; 
import WbSunnyIcon from '@mui/icons-material/WbSunny';




const SidebarRight = () => {

  const {darkModeOn, toggleDarkTheme} = useContext(AppStatesContext); 


   


  return (
    <div className={darkModeOn?"sidebarRight-dark": "sidebarRight"}>
      <IconButton onClick={toggleDarkTheme}>
        {darkModeOn ? 
        <WbSunnyIcon sx={{ fontSize: 30, color: '#1da1f2' }}/> 
        : 
        <Brightness2Icon sx={{ fontSize: 30,  color: '#1da1f2' }}/>} 
      </IconButton>
       <h1>this is the right sidebar</h1>
    </div>

   
  );
}

export default SidebarRight

