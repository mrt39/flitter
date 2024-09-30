/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { Button, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { UserContext, AppStatesContext} from '../App.jsx';

import '../styles/FollowButton.css';

const FollowButton = ({ displayedUserOnCard }) => {

    const { currentUser } = useContext(UserContext); 
    const {darkModeOn, pressedFollow, setPressedFollow} = useContext(AppStatesContext); 

    const [loading, setLoading] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)

    const [isHovered, setIsHovered] = useState(false);


    //decide isFollowing state
    useEffect(() => {
        if(displayedUserOnCard.followedbytheseID.includes(currentUser._id)){
            setIsFollowing(true)
        }else{
            setIsFollowing(false)
        }
    }, [pressedFollow]);



    function handleFollow(e){
        e.preventDefault()
        e.stopPropagation(); // Prevent the event from bubbling up to the Tooltip
        setLoading(true)
        setPressedFollow(true);
      }
      
    
      //useEffect for handling follow
        useEffect(() => {
          async function followUser() { 
            await fetch(import.meta.env.VITE_BACKEND_URL+'/followUser', {
              method: "post",
              body: JSON.stringify({ fromUser: currentUser, toUser: displayedUserOnCard}), 
              headers: {
                  'Content-Type': 'application/json',
                  "Access-Control-Allow-Origin": "*",
              },
              credentials:"include" //required for sending the cookie data-authorization check
          })
            .then(async result => {
              if (result.ok){
                await result.json();
                console.log("Followed/Unfollowed Succesfully!")
                setPressedFollow(false)
                setLoading(false)
              } else{
                throw new Error(result)
              }
            })
            .catch(error => {
              console.error('Error:', error);
              setPressedFollow(false)
              setLoading(false)
            }); 
          }
          //only trigger when followed
          if (pressedFollow ===true){
            followUser();
          } 
        }, [pressedFollow]);


    return (
        <Button
        variant="outlined"
        size="small"
        onClick={handleFollow}
        disabled={loading}
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
        onMouseEnter={() => setIsHovered(true)} // Set hovered state to true
        onMouseLeave={() => setIsHovered(false)} // Set hovered state to false
        >
            {isFollowing && isHovered ? 'Unfollow' : isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
};

export default FollowButton;