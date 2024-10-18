/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { UserContext, AppStatesContext} from '../App.jsx';
import { Button} from '@mui/material';

import '../styles/FollowButton.css';

const FollowButton = ({ displayedUserOnCard, location, firstRender, handleTooltipClose }) => {

    const { currentUser} = useContext(UserContext); 

    //pass the follow states from AppStatesContext in App.jsx
    //sending a post request within the tooltip and its child components disrupts the display of the tooltip and/or the follow logic, so the follow logic is defined in App.jsx to prevent that.
    const {darkModeOn, pressedFollow, setPressedFollow, loadingFollow, setLoadingFollow, setUsertoFollow} = useContext(AppStatesContext); 

    const [isFollowing, setIsFollowing] = useState(false)

    const [isHovered, setIsHovered] = useState(false);


    //decide isFollowing state
    useEffect(() => {
        if(displayedUserOnCard.followedbytheseID.includes(currentUser._id)){
            setIsFollowing(true)
            //if the followbutton is rendered within the profile page, set the isFollowing state to false to prevent the follow button from displaying the wrong state
            //check if the usercardprofile component is rendered for the first time as well, to prevent the follow button from displaying the wrong state
            if(location === 'profilePage'&&firstRender===false){
                setIsFollowing(false)
            }
        }else{
            setIsFollowing(false)
            if(location === 'profilePage'&&firstRender===false){
              setIsFollowing(true)
          }
        }
    }, [pressedFollow]);



    function handleFollow(e){
      //if handleTooltipClose is passed as a prop (from the tooltip that displays the HoverUserCard), call it
      if(handleTooltipClose){
        handleTooltipClose()
      }
        e.preventDefault()
        e.stopPropagation(); //prevent the event from bubbling up to the Tooltip
        setUsertoFollow(displayedUserOnCard)
        if (!loadingFollow) { //if loading, do not send another request
          setLoadingFollow(true);
          setPressedFollow((prev) => !prev); // toggle the pressedFollow state
      }
      }
      
    
  

    return (
        <Button
        variant="outlined"
        size="small"
        onClick={handleFollow}
        disabled={loadingFollow}
        className="followButton"
        sx={{
          borderRadius: '9999px', 
          textTransform: 'none',
          padding: '6px 16px',
          borderColor: (darkModeOn ? 'white' : 'gray'),
          backgroundColor: isFollowing 
            ? 'transparent' 
            : (darkModeOn ? 'rgb(239, 243, 244)' : 'rgb(15, 20, 25);'),
          color: isFollowing 
            ? (darkModeOn ? 'white' : 'black') 
            : (darkModeOn ? 'black' : 'white'),
          '&:hover': {
            backgroundColor: isFollowing 
              ? 'rgba(255, 0, 0, 0.1)' 
              : (darkModeOn ? 'rgb(215, 219, 220)' : 'rgb(39, 44, 48);'),
              borderColor: isFollowing ? 'red' : (darkModeOn ? 'white' : 'gray'),
            color: isFollowing ? 'red' : (darkModeOn ? 'black' : 'white'),
          },
        }}
        onMouseEnter={() => setIsHovered(true)} //set hovered state to true
        onMouseLeave={() => setIsHovered(false)} //set hovered state to false
        >
            {isFollowing && isHovered ? 'Unfollow' : isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
};

export default FollowButton;