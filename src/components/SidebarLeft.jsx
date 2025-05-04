/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLink from './SidebarLink.jsx';
import EditProfileModal from './EditProfileModal.jsx';
import UserAvatar from './UserAvatar.jsx';
import SubmitPostModal from './SubmitPostModal.jsx';
import { Button, Menu, MenuItem, ListItemIcon } from '@mui/material';
//icons
import HomeIcon from '@mui/icons-material/Home';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import Logout from '@mui/icons-material/Logout';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Brightness2Icon from '@mui/icons-material/Brightness2'; 
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LogoImg from '../assets/logo.png';
import { useUI } from '../contexts/UIContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';

import '../styles/SidebarLeft.css';

const SidebarLeft = () => {
    //use context hooks
    const {darkModeOn, toggleDarkTheme} = useUI(); 
    const {currentUser, handleSignOut} = useAuth();
    const {handleProfileRouting} = useUser();

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

    function handleSignOutClick() {
      handleSignOut()
      .then((success) => {
        if (success) {
          navigate('/login');
        }
      })
      .catch(error => {
        console.error('Error signing out:', error);
      });
      
      //close the menu
      handleClose();
    }

    return (
      <div className={`sidebarLeft ${darkModeOn ? 'dark-mode' : ''}`}>
          <div className="sidebarLogo">
            <img src={LogoImg} alt="logo" />
          </div>
          <span onClick={() => navigate("/")}>
              <SidebarLink text="Home" Icon={HomeIcon} />
          </span>

          <span onClick={() => handleProfileRouting(currentUser)} >
              <SidebarLink text="Profile" Icon={PermIdentityIcon} />
          </span>

          <span onClick={toggleDarkTheme} >
              <SidebarLink text="Theme" Icon={darkModeOn ? Brightness2Icon : WbSunnyIcon} />
          </span>
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

              <p className='leftSideBar-username'>{currentUser.name}</p>
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
          <MenuItem className='sidebarMenuItem' onClick={handleOpenEditProfileModal}>
            <ListItemIcon >
              <EditOutlinedIcon className='sidebarMenuIcon' fontSize="small" />
            </ListItemIcon>
            Edit Profile
          </MenuItem>
          <MenuItem className='sidebarMenuItem' onClick={handleSignOutClick}>
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