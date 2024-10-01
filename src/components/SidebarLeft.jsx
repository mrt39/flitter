/* eslint-disable react/prop-types */
import { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppStatesContext } from '../App.jsx';
import '../styles/SidebarLeft.css';
import SidebarLink from './SidebarLink.jsx';
import SubmitPostModal from './SubmitPostModal.jsx';

// MUI Imports
import { 
  Avatar, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon 
} from '@mui/material';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Logout from '@mui/icons-material/Logout';


// Assets
import LogoImg from '../assets/logo.png';

// Utility
import slugify from 'slugify'; // for generating the URL path for routing




const SidebarLeft = ({user, setCurrentUser}) => {

    const {darkModeOn} = useContext(AppStatesContext); 


    const [anchorEl, setAnchorEl] = useState(document.querySelector('#sideBarAccountMenu'));
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };


    const navigate = useNavigate(); 




  //handle generating the url path for routing to /profile/:slug
  function handleProfileRouting(){
    //slugify the username, e.g:"john-doe"
    const slug = slugify(user.name, { lower: true }); 
    //combine slug with usershortID to create the unique profile path for the selected user to route to
    const profilePath = `/profile/${slug}-${user.shortId}`
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
      //close the menu
      handleClose() 
  }



  return (
    <div className={darkModeOn?"sidebarLeft-dark": "sidebarLeft"}>
        <div className="sidebarLogo">
          <img src={LogoImg} alt="logo" />
        </div>
        <Link className="sidebarLink" to="/">
            <SidebarLink text="Home" Icon={HomeIcon} />
        </Link>
        <SidebarLink text="Explore" Icon={SearchIcon} />
        <SidebarLink text="Notifications" Icon={NotificationsNoneIcon} />
        <SidebarLink text="Messages" Icon={MailOutlineIcon} />
        <SidebarLink text="Bookmarks" Icon={BookmarkBorderIcon} />
        <SidebarLink text="Lists" Icon={ListAltIcon} />
        <Link  className="sidebarLink" to={handleProfileRouting()} >
            <SidebarLink text="Profile" Icon={PermIdentityIcon} />
        </Link>
        <Link className="sidebarLink" to="/profileedit">
            <SidebarLink text="More" Icon={MoreHorizIcon}/>
        </Link>

        {/* use different react components for forms in homepage and navbar in order to seperate concerns and avoid state/post logic clashing */}
        <SubmitPostModal
        currentUser = {user}
        />


        <Button
            id='sidebarUserIconBtn'
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'sideBarAccountMenu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar 
                sx={{ width: 32, height: 32 }}
                alt={user.name}
                src={user.picture? user.picture : user.uploadedpic}
            >

            </Avatar>
            <p>{user.name}</p>
            <p id='sidebarUserIconBtn3Dot'>...</p>
        </Button>

        <Menu
        anchorEl={anchorEl}
        id="sideBarAccountMenu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              width: "220px",
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 51,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>




    </div>

   
  );
}

export default SidebarLeft

