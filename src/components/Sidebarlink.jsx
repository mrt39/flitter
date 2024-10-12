/* eslint-disable react/prop-types */
import { useContext } from 'react';
import { AppStatesContext } from '../App.jsx';
import '../styles/Sidebarlink.css'

function SidebarLink({ text, Icon }) {

  const {darkModeOn} = useContext(AppStatesContext); 

  return(
    <div className={`sidebarLink ${darkModeOn ? 'dark-mode' : ''}`}>
        <Icon />
        <h2>{text}</h2>
    </div>
  );
}
export default SidebarLink;