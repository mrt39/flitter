/* eslint-disable react/prop-types */
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppStatesContext, UserContext } from '../App.jsx';
import SidebarLink from './SidebarLink.jsx';
import EditProfileModal from './EditProfileModal.jsx';
import UserAvatar from './UserAvatar.jsx';
import SubmitPostModal from './SubmitPostModal.jsx';
import {Button, Menu, MenuItem, ListItemIcon } from '@mui/material';
//icons
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Logout from '@mui/icons-material/Logout';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import LogoImg from '../assets/logo.png';

import '../styles/SidebarLeft.css';






const SidebarLeft = () => {

    const {darkModeOn, handleProfileRouting} = useContext(AppStatesContext); 
    const {currentUser, setCurrentUser} = useContext(UserContext);


    const [anchorEl, setAnchorEl] = useState(document.querySelector('#sideBarAccountMenu'));
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    const navigate = useNavigate(); 

    //handle opening and closing the edit profile modal
    const [openEditProfileModal, setOpenEditProfileModal] = useState(false);
    const handleOpenEditProfileModal = () => setOpenEditProfileModal(true);
    const handleCloseEditProfileModal = () => setOpenEditProfileModal(false);


  function handleSignOut(){
      fetch(import.meta.env.VITE_BACKEND_URL+'/logout',{
      method: 'POST',
      credentials: 'include' //sends cookies to server, so it can log out/unauthenticate currentUser!
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
    <div className={`sidebarLeft ${darkModeOn ? 'dark-mode' : ''}`}>
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
        <span onClick={() => handleProfileRouting(currentUser)} >
            <SidebarLink text="Profile" Icon={PermIdentityIcon} />
        </span>
            <SidebarLink text="More" Icon={MoreHorizIcon}/>

        {/* use different react components for forms in homepage and navbar in order to seperate concerns and avoid state/post logic clashing */}
        <SubmitPostModal/>


        <Button
            id='sidebarUserIconBtn'
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'sideBarAccountMenu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <UserAvatar 
                user={currentUser} 
                source="post"
            />

            <p>{currentUser.name}</p>
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
        <MenuItem className='sidebarMenuItem'onClick={handleOpenEditProfileModal}>
          <ListItemIcon >
            <EditOutlinedIcon className='sidebarMenuIcon' fontSize="small" />
          </ListItemIcon>
          Edit Profile
        </MenuItem>
        <MenuItem className='sidebarMenuItem' onClick={handleSignOut}>
          <ListItemIcon >
            <Logout className='sidebarMenuLogoutIcon' fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      <EditProfileModal open={openEditProfileModal} handleClose={handleCloseEditProfileModal} />

    </div>


  );
}

export default SidebarLeft

