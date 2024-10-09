/* eslint-disable react/prop-types */
import { useState,  useEffect, useContext } from 'react'
import { UserContext, AppStatesContext } from '../App.jsx';
import FollowButton from './FollowButton.jsx';
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Avatar, useTheme, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "../styles/Profile.css"
//imports for generating the url path for routing 
import slugify from 'slugify';

import '../styles/UserCardProfile.css';

const UserCardProfile = () => {


    // Pass the UserContext defined in app.jsx
    const {currentUser, selectedUser} = useContext(UserContext); 
    const {allPosts, darkModeOn} = useContext(AppStatesContext); 

    const theme = useTheme();

    const navigate = useNavigate(); 

        //handle generating the url path for routing to /profile/:slug/followers
        function handleFollowersRouting(string){
            //slugify the username, e.g:"john-doe"
            const slug = slugify(selectedUser.name, { lower: true }); 
            //combine slug with usershortID to create the unique profile path for the selected user to route to
            const profilePath = `/profile/${slug}-${selectedUser.shortId}/${string}`
            // Route to the profile path
            navigate(profilePath); 
        }

        //state to determine if the component is rendered for the first time, to prevent the follow button from displaying the wrong state
        const [firstRender, setFirstRender] = useState(true); 

        useEffect(() => {
            setFirstRender(false)
    }, []);



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
                        {allPosts.filter((post) => post.from[0].shortId ===selectedUser.shortId).length} posts
                    </Typography>    
                </div>  
            </div>
            <div className="header-background"></div>
            <div className="profile-content-and-followButton-container"> 
                <div className="profile-content">
                    <Avatar
                        alt={selectedUser.name}
                        src={selectedUser.picture ? selectedUser.picture : selectedUser.uploadedpic}
                        className="avatar"
                    />
                    <CardContent className="card-content">
                        <Typography variant="h5" component="div" fontWeight="bold" className="username">
                        {selectedUser.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" className="bio">
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
                    )
                    :
                    <Link to="/profileedit">
                        <Button
                        variant="outlined"
                        size="small"
                        className="editProfileButton"
                        sx={{
                        borderRadius: '9999px', 
                        textTransform: 'none',
                        padding: '6px 16px',
                        borderColor: (darkModeOn ? 'white' : 'gray'),
                        backgroundColor: 'transparent',
                        color: darkModeOn ? 'white' : 'black', 
                        '&:hover': {
                            backgroundColor: darkModeOn ? 'rgb(39, 44, 48);': 'rgb(215, 219, 220)' ,
                        },
                        }}
                        >
                            Edit Profile
                        </Button>
                    </Link>
                    }
                </div>
            </div>
        </Card>
    );
};


export default UserCardProfile;

