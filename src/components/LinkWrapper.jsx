/* eslint-disable react/prop-types */

//component for wrapping links to enable opening in new tabs/windows while preserving custom click handling
import { Link } from "react-router-dom";
import { forwardRef } from "react";

//using react's forwardRef API here to be able to use LinkWrapper for HoverUserCard component, which displays a MUI tooltip
//MUI's tooltip component needs to attach a ref to its child component to:
//track its position on screen, measure its dimensions and know when to show/hide the tooltip
const LinkWrapper = forwardRef(({ to, onClick, children, ...props }, ref) => {
  function handleClick(e) {
    //handle left clicks (button === 0)
    if (e.button === 0 && onClick) {
      e.preventDefault();
      onClick(e);
    }
  }

  return (
    <Link 
      ref={ref}
      to={to} 
      onClick={handleClick} 
      {...props}
    >
      {children}
    </Link>
  );
});

//add display name for better debugging
LinkWrapper.displayName = 'LinkWrapper';

export default LinkWrapper;