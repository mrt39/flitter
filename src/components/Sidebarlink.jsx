/* eslint-disable react/prop-types */

import '../styles/Sidebarlink.css'

function SidebarLink({ text, Icon }) {
  return(
    <div className="link">
        <Icon />
        <h2>{text}</h2>
    </div>
  );
}
export default SidebarLink;