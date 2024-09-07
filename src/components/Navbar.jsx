/* eslint-disable react/prop-types */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import '../styles/Navbar.css';
import MuiAvatar from "../components/MuiAvatar.jsx";
import LogoImg from "../assets/logo.png";
//imports for generating the url path for routing 
import slugify from 'slugify';



const Navbar = ({user, setCurrentUser}) => {

  const [currentRoute, setcurrentRoute] = useState(useLocation())

  var location = useLocation();

  const navigate = useNavigate(); 

  useEffect(() => {
    setcurrentRoute(location.pathname)
  }, [location]); // Only re-run the effect if count changes


  //handle generating the url path for routing to /profile/:slug
  function handleProfileRouting(){
    //slugify the username, e.g:"john-doe"
    const slug = slugify(user.name, { lower: true }); 
    // Convert the user ID to a number and then encode it in Base36
    const base36 = parseInt(user._id, 16).toString(36);
    // Truncate to 8 characters to make it even shorter
    const shortenedId = base36.substring(0, 7);
    //combine both to create the profile path for the selected user to route to
    const profilePath = `/profile/${slug}-${shortenedId}`
    return profilePath
  }


  function handleSignOut(){
      fetch(import.meta.env.VITE_BACKEND_URL+'/logout',{
      method: 'POST',
      credentials: 'include' //sends cookies to server, so it can log out/unauthenticate user!
      })
      .then(async result => {
        if (result.ok) {
          let response = await result.json(); 
          console.warn(response); 
          await setCurrentUser(null)
          navigate('/login'); // Route to /login upon successful logout
        } else {
          throw new Error(result);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
 
  }


  return (
    <>
      <div className="d-flex flex-column flex-shrink-0 bg-body-tertiary" style={{width: "4.5rem"}}>
        <div className="navbarLogo">
          <img src={LogoImg} alt="logo" />
        </div>
      <ul className="nav nav-pills nav-flush flex-column mb-auto text-center">
      <Link to="/">
        <li className="nav-item">
          <div href="#" className={(currentRoute==="/"? "active" :"") + " nav-link py-3 border-bottom rounded-0"} aria-current="page" title="Messages"  data-bs-placement="right">
          <Icon.ChatLeftDots className="bi pe-none" width="24" height="24" aria-label="Messages"/>          
          </div>
        </li>
      </Link>
        <Link  to={handleProfileRouting()}  >
        <li >
          <div href="#" className={(currentRoute==="/profile"? "active" :"") + " nav-link py-3 border-bottom rounded-0"} title="Profile" data-bs-placement="right">
            <Icon.PersonCircle  className="bi pe-none" width="24" height="24" aria-label="Profile"/>
          </div>
        </li>
      </Link>
      <Link to="/profileedit">
        <li>
          <div href="#" className={(currentRoute==="/findpeople"? "active" :"") + " nav-link py-3 border-bottom rounded-0"}  title="Find People!"  data-bs-placement="right">
          <Icon.PeopleFill  className="bi pe-none" width="24" height="24" role="img" aria-label="Find People!"/>
          </div>
        </li>
        </Link>
      </ul>
      <div className="dropdown border-top">
        <a href="#" className="d-flex align-items-center justify-content-center p-3 link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <div className="navbarAvatar">
          <MuiAvatar
              user={user}
            />
            </div>
        </a>
        <ul className="dropdown-menu text-small shadow">
          <li><a className="dropdown-item" href="#" onClick={handleSignOut}>Sign out</a></li>
        </ul>
      </div>
    </div>
  </>
  );
  };
    
    
export default Navbar;