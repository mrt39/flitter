/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import { useFollow } from '../contexts/FollowContext.jsx';
import '../styles/FollowButton.css';

const FollowButton = ({ displayedUserOnCard, handleTooltipClose }) => {
  const { currentUser } = useAuth();
  const { darkModeOn } = useUI();
  const { loadingFollow,  userRefreshPending, optimisticFollowState, handleOptimisticFollow} = useFollow();

  const [isFollowing, setIsFollowing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);


    //decide isFollowing state
    useEffect(() => {
      //first check if we have an optimistic state for this user
      const userId = displayedUserOnCard._id;
      //does this user have an entry in our optimistic state object (true or false)
      const hasOptimisticState = optimisticFollowState[userId] !== undefined;
      if (hasOptimisticState) {
      //if yes, use the optimistic state value (true or false)
      setIsFollowing(optimisticFollowState[userId]);
      } else if (currentUser.followingtheseID && currentUser.followingtheseID.includes(displayedUserOnCard._id)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    }, [loadingFollow, currentUser, optimisticFollowState, displayedUserOnCard]);

    function handleFollow(e){
      //if handleTooltipClose is passed as a prop (from the tooltip that displays the HoverUserCard), call it
      if(handleTooltipClose){
        handleTooltipClose()
      }
        //stop event propagation so clicks don't trigger parent elements
        e.preventDefault()
        e.stopPropagation(); //prevent the event from bubbling up to the Tooltip

        //use optimistic update handler, which handles setLoadingFollow and setPressedFollow states
        handleOptimisticFollow(displayedUserOnCard);
      }

    return (
        <Button
        variant="outlined"
        size="small"
        onClick={handleFollow}
        disabled={loadingFollow || userRefreshPending}
        className={`followButton ${darkModeOn ? 'dark-mode' : ''}`} 
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