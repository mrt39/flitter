/* eslint-disable react/prop-types */
import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppStatesContext } from '../App.jsx';
import '../styles/SidebarRight.css';






const SidebarRight = ({user, setCurrentUser, toggleDarkTheme}) => {

  const {darkModeOn} = useContext(AppStatesContext); 



   


  return (
    <div className={darkModeOn?"sidebarRight-dark": "sidebarRight"}>
       <h1>this is the right sidebar</h1>
    </div>

   
  );
}

export default SidebarRight

