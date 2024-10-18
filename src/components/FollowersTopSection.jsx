/* eslint-disable react/prop-types */
import { useContext } from 'react';
import { useLocation, useNavigate} from "react-router-dom";
import { AppStatesContext } from '../App.jsx';
import { Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import '../styles/FollowersTopSection.css';


const FollowersTopSection = ({currentPathFollowers, setCurrentPathFollowers}) => {

    const {darkModeOn} = useContext(AppStatesContext); 

    //get the shortid of the user from the current URL
    const location = useLocation();
    // Get the pathname from the location object
    const path = location.pathname;
    // Extract the last 10 characters (either "following" or "followers")
    const urlWithoutCurrentpath = path.slice(0, -10);

    const navigate = useNavigate(); 

    //handle generating the url path for routing to /profile/:slug-shortid/followers or /profile/:slug-shortid/following
    function handleFollowersRouting(path){
        //combine the url without the current path with the path
        const followersPath = `${urlWithoutCurrentpath}/${path}`
        // Route to the profile path
        navigate(followersPath); 
    }

    //handle generating the url path when the user clicks on the back button (/profile/:slug-shortid/)
    function handleProfileRouting(){
        const profilePath = `${urlWithoutCurrentpath}`
        // Route to the profile path
        navigate(profilePath); 
    }


    return (
        <>
        <div className="top-header-followersTopSection">
            <div className="top-header-backButton">
                <IconButton onClick={() => {handleProfileRouting()}} className="back-button-followersTopSection">
                    <ArrowBackIcon />
                </IconButton>
            </div>
            <div className="top-header-text-followersTopSection">
                <Typography variant="h5" component="div" fontWeight="bold" className="username">
                        Profile
                </Typography>   
            </div>  
        </div>
        <div className={`followersTopSection-container ${darkModeOn ? 'dark-mode' : ''}`}>
            <div className="tabs">
                <div
                className={`tab ${darkModeOn ? 'dark-mode' : ''} ${currentPathFollowers === 'followers' ? 'active' : ''}`}
                onClick={() => {setCurrentPathFollowers('followers'); handleFollowersRouting("followers")}}
                >
                    <div className='topsection-text-and-underline-container'>
                        <span>Followers</span>
                        {currentPathFollowers === 'followers' && <div className="underline"></div>}
                    </div>
                </div>
                <div
                className={`tab ${darkModeOn ? 'dark-mode' : ''} ${currentPathFollowers === 'following' ? 'active' : ''}`}
                onClick={() => {setCurrentPathFollowers('following'); handleFollowersRouting("following")}}
                >
                    <div className='topsection-text-and-underline-container'>
                        <span>Following</span>
                        {currentPathFollowers === 'following' && <div className="underline"></div>}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
    };

export default FollowersTopSection;