/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import FollowButton from './FollowButton.jsx';
import EditProfileModal from './EditProfileModal.jsx';
import UserAvatar from './UserAvatar.jsx';
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, useTheme, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { usePost } from '../contexts/PostContext.jsx';
import { createFollowersRoute } from '../utilities/routingUtils.js';
import "../styles/Profile.css"
import '../styles/UserCardProfile.css';

const UserCardProfile = () => {
  //use context hooks
  const { currentUser } = useAuth(); 
  const { selectedUser } = useUser(); 
  const { allPosts } = usePost(); 
  const { darkModeOn } = useUI();

  const theme = useTheme();
  const navigate = useNavigate(); 

  //handle generating the url path for routing to /profile/:slug/followers
  function handleFollowersRouting(string){
    const profilePath = createFollowersRoute(selectedUser, string);
    // route to the profile path
    navigate(profilePath); 
  }

  //state to determine if the component is rendered for the first time, to prevent the follow button from displaying the wrong state
  const [firstRender, setFirstRender] = useState(true); 

  useEffect(() => {
    setFirstRender(false)
  }, []);

  //handle opening and closing the edit profile modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Card className="user-card-profile">
      <div className="top-header">
        <div className="top-header-backButton">
          <IconButton onClick={() => navigate(-1)} className="back-button">
            <ArrowBackIcon />
          </IconButton>
        </div>
        <div className="top-header-text">
          <Typography variant="h5" component="div" fontWeight="bold" className="username">
            {selectedUser.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="header-postCount">
            {allPosts.filter((post) => post.from.shortId === selectedUser.shortId).length} posts
          </Typography>    
        </div>  
      </div>
      <div className="header-background">
        <img src={selectedUser.banner} alt="banner" className="header-image"/>
      </div>
      <div className="profile-content-and-followButton-container"> 
        <div className="profile-content">
          <UserAvatar
            user={selectedUser}
            source={"userCardProfile"}
          />
          <CardContent className="card-content">
            <Typography variant="h5" component="div" fontWeight="bold" className="username">
              {selectedUser.name}
            </Typography>
            <Typography variant="body2" className={`userBio ${darkModeOn ? 'dark-mode' : ''}`}>
              {selectedUser.bio}
            </Typography>
            <div className="follow-info">
              <Link onClick={() => handleFollowersRouting("following")} className="follow-link">
                <Typography className="UserCardFollowersLink" variant="body2" color="text.secondary">
                  <span className='userCardFollowerNumber' style={{ color: theme.palette.text.primary}}>
                    {selectedUser.followingCount}
                  </span>&#8203; Following  {/* arrange space between the number and the "Following text" */}
                </Typography>
              </Link>
              <Link onClick={() => handleFollowersRouting("followers")} className="follow-link">
                <Typography className="UserCardFollowersLink" variant="body2" color="text.secondary">
                  <span className='userCardFollowerNumber' style={{ color: theme.palette.text.primary}}>
                    {selectedUser.followerCount}
                  </span>&#8203; Followers
                </Typography>
              </Link>
            </div>  
          </CardContent>
        </div>
        <div className='follow-button-container'>
          {/* display the "edit profile" button instead of the follow button when the user hovers on their own name */}
          {currentUser._id !== selectedUser._id ? (
            <FollowButton
              displayedUserOnCard={selectedUser}
              location="profilePage"
              firstRender={firstRender}
            />
          ) : (
            <Button
              onClick={handleOpen}
              variant="outlined"
              size="small"
              className="editProfileButton"
              sx={{
                fontWeight: 'bold',
                fontSize: '15px',
                borderRadius: '9999px', 
                textTransform: 'none',
                padding: '6px 16px',
                borderColor: (darkModeOn ? 'rgb(83, 100, 113);' : 'gray'),
                backgroundColor: 'transparent',
                color: darkModeOn ? 'white' : 'black', 
                '&:hover': {
                  backgroundColor: darkModeOn ? 'rgb(39, 44, 48);': 'rgb(215, 219, 220)' ,
                },
                maxWidth: '100%',
                width: 'auto',
                /* whiteSpace: 'nowrap', */
                overflow: 'auto',
                textOverflow: 'ellipsis',
              }}
            >
              Edit Profile
            </Button>
          )}

          <EditProfileModal open={open} handleClose={handleClose} />
        </div>
      </div>
    </Card>
  );
};

export default UserCardProfile;