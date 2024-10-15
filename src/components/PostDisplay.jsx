/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import CommentModal from './CommentModal.jsx';
import HoverUserCard from './HoverUserCard.jsx';
import UserAvatar from './UserAvatar.jsx';
import { UserContext, AppStatesContext} from '../App.jsx';
import { Avatar } from '@mui/material';
import { ListItemText,  ListItemAvatar, Box} from '@mui/material';
import {  Typography,  IconButton,  } from '@mui/material';
import { Favorite, FavoriteBorder} from '@mui/icons-material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

//imports for generating the url path for routing 
import slugify from 'slugify';
import '../styles/PostDisplay.css'


const PostDisplay = ({post, location}) => {

    //Pass the UserContext defined in app.jsx
    const { currentUser, setSelectedUser } = useContext(UserContext); 

    const {refreshPosts, setRefreshPosts, darkModeOn, handleProfileRouting} = useContext(AppStatesContext); 

    //state for storing if the currentuser has already liked this post
    const [currentUserLikedPost, setCurrentUserLikedPost] = useState(false); // Like state for individual post

    //Id for liking the posts
    const [pressedLikePost, setPressedLikePost] = useState(false); // Like state for individual post

    // Temporary state for like animation (in order to remove the "liked" class after 0.3 seconds, to prevent the animation from playing when the user likes another post)
    const [tempLiked, setTempLiked] = useState(false); // Temporary state for like animation

      
    function handleLike(){
        setTempLiked(true);
        setTimeout(() => setTempLiked(false), 300); //remove the liked class after 0.3 seconds
        setPressedLikePost(true)
    }

    //useffect for liking posts
    useEffect(() => {
        async function likePost() {
        //find if post is already liked by the user, if user is already in likedby array, in order to properly display (filled or empty+like animation) the heart icon in ui
        //find via converting id objects to string because querying with id's doesn't work
        const likedPostIndex = post.likedby.findIndex(u => u._id.toString() === currentUser._id.toString());

        await fetch(import.meta.env.VITE_BACKEND_URL+'/likePost', {
            method: "PATCH",
            // storing date as isostring to make the reading easier later
            body: JSON.stringify({ postID: post._id, likedBy: currentUser}), 
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
            },
            credentials:"include" //required for sending the cookie data-authorization check
        })
        .then(async result => {
            if (result.ok){
            await result.json();
            setCurrentUserLikedPost(likedPostIndex === -1); //update state based on whether the user has liked this post or not
            console.log("Liked Post!")
            setPressedLikePost(false)
            setRefreshPosts(!refreshPosts)
            } else{
            throw new Error(result)
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setPressedLikePost(false)
        }); 
        }
        //only trigger when comment is posted
        if (pressedLikePost){
        likePost();
        } 
    }, [pressedLikePost]);

  
//define the component here, in order to not to repeat the code in the "location === "singular-post-page" ?" statement below
  const PostContent = ({ post, handleProfileRouting, handleLike }) => (
    <span className={`postContentContainer ${darkModeOn ? 'dark-mode' : ''}`}>
        <span className="usernameLinkOnPost avatarLink" onClick={(e) => {
            e.preventDefault();
            handleProfileRouting(post.from[0]);
        }}>
            <ListItemAvatar>
                <UserAvatar
                    user={post.from[0]}
                    source="post"
                />
            </ListItemAvatar>
        </span>
        <ListItemText
            primary={(
                <div className="post-header">
                    {/* MUI tooltip that will display a user card on hover */}
                    <Tooltip 
                        title={
                            <Box sx={{ minWidth: 280 }}> 
                                <HoverUserCard 
                                user={post.from[0]} 
                                />
                                
                            </Box>
                        }
                        enterDelay={200}
                        leaveDelay={200}
                        placement="bottom"
                        PopperProps={{
                            modifiers: [
                                {
                                    name: 'arrow',
                                    enabled: false, 
                                },
                            ],
                            sx: {
                              '.MuiTooltip-tooltip': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none', 
                                padding: 0,
                              },
                            },
                          }}        
                    > 
                        <span
                            className="usernameLinkOnPost"
                            onClick={(e) => {
                                e.preventDefault();
                                handleProfileRouting(post.from[0]);
                            }}
                        >
                            <Typography variant="subtitle1" className="post-name">
                                {post.from[0].name}
                            </Typography>

                        </span>
                    </Tooltip>
                    <Typography variant="body2" color="textSecondary" className={`post-date ${darkModeOn ? 'dark-mode' : ''}`}>
                        {dayjs(new Date(post.date)).format('MMM D, H:mm')}
                    </Typography>
                </div>
            )}
            secondary={(
                <>
                    <Typography component="span" variant="body1" className={`post-content ${darkModeOn ? 'dark-mode' : ''}`}
                    >
                        {post.image ? (
                            <img className="postImg" src={post.image} alt="image" />
                        ) : (
                            <span>{post.message}</span>
                        )}
                    </Typography>
                    {location && location === "comment-modal" ? "" : (
                        <span className="post-actions">
                            <CommentModal post={post} />
                            <IconButton
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLike();
                                }}
                                size="small"
                                 //as "tempLiked" becomes false in 0.3 seconds, liked class will be removed from the button, thus preventing multiple posts from playing the animation at the same time 
                                className={`icon-button like-button ${currentUserLikedPost && tempLiked ? 'liked' : ''}`}

                            >

                                {post.likedby.findIndex(u=>u._id.toString()===currentUser._id.toString())>-1 ?  //find if post is already liked by the user, if user is already in likedby array
                                (
                                <Favorite fontSize="small" 
                                sx={{ 
                                    color: 'rgb(249, 24, 128)', 
                                }} />
                                ) : ( //if it isn't liked, display an empty heart icon
                                <FavoriteBorder fontSize="small" sx={{ color: darkModeOn ? 'rgb(113, 118, 123)' : 'rgb(83, 100, 113)' }} />
                                )}

                                <Typography component="span" variant="body2" className={`postLikeCommentCount ${darkModeOn ? 'dark-mode' : ''}`}>
                                    {post.likeCount}
                                </Typography>
                            </IconButton>
                        </span>
                    )}
                </>
            )}
        />
    </span>
);

return (
    <span className="postDisplayContainer">
        {location === "singular-post-page" ? (
            <PostContent post={post} handleProfileRouting={handleProfileRouting} handleLike={handleLike} />
        ) : (
            <Link className={`singularPostLinkOnPost ${darkModeOn ? 'dark-mode' : ''}`} to={`/post/${post._id}`}>
                <PostContent post={post} handleProfileRouting={handleProfileRouting} handleLike={handleLike} />
            </Link>
        )}
    </span>
);
};

export default PostDisplay;


