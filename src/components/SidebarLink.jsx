/* eslint-disable react/prop-types */
import { useUI } from '../contexts/UIContext.jsx';
import '../styles/Sidebarlink.css'

function SidebarLink({ text, Icon }) {

  const { darkModeOn } = useUI();

  return(
    <div className={`sidebarLink ${darkModeOn ? 'dark-mode' : ''}`}>
        <Icon />
        <h2>{text}</h2>
    </div>
  );
}
export default SidebarLink;
