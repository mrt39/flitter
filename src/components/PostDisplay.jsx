/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import CommentModal from './CommentModal.jsx';
import { UserContext, AppStatesContext} from '../App.jsx';
import { Avatar } from '@mui/material';
import { ListItemText,  ListItemAvatar} from '@mui/material';
import {  Typography,  IconButton,  } from '@mui/material';
import { FavoriteBorder} from '@mui/icons-material';


//imports for generating the url path for routing 
import slugify from 'slugify';
//infinite scroll 
import '../styles/PostDisplay.css'



const PostDisplay = ({post}) => {

  //Pass the UserContext defined in app.jsx
  const { currentUser, setSelectedUser } = useContext(UserContext); 

  const {refreshPosts, setRefreshPosts} = useContext(AppStatesContext); 



  //Id for liking the posts
  const [pressedLikePost, setPressedLikePost] = useState(false); // Like state for individual post




  const navigate = useNavigate(); 

  //handle generating the url path for routing to /profile/:slug
  function handleProfileRouting(clickedOnUser){
    setSelectedUser(clickedOnUser)
    //slugify the username, e.g:"john-doe"
    const slug = slugify(clickedOnUser.name, { lower: true }); 
    //combine slug with usershortID to create the unique profile path for the selected user to route to
    const profilePath = `/profile/${slug}-${clickedOnUser.shortId}`
    // Route to the profile path
    navigate(profilePath); 
  }
    

      
  function handleLike(){
    setPressedLikePost(true)
  }

   //useffect for liking posts
   useEffect(() => {
    async function likePost() {
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



  

  return (
    < >
    <Link className="singularPostLinkOnPost" to={`/post/${post._id}`}>
        <span 
            className="usernameLinkOnPost" 
            onClick={(e) => 
                {e.preventDefault();  //prevent routing to the post, which is the parent element within the PostDisplay.jsx
                handleProfileRouting(post.from[0] //route to profile instead
            )}}
        >
            <ListItemAvatar>
            <Avatar 
                    alt={post.from[0].name}
                    src={post.from[0].picture? post.from[0].picture : post.from[0].uploadedpic}
                />
            </ListItemAvatar>
        </span>
        <ListItemText
            primary={
            <div className="post-header">
              <span 
                  className="usernameLinkOnPost" 
                  onClick={(e) => 
                      {e.preventDefault();  //prevent routing to the post, which is the parent element within the PostDisplay.jsx
                      handleProfileRouting(post.from[0] //route to profile instead
                  )}}
              >
                <Typography variant="subtitle1" className="post-name">
                {post.from[0].name}
                </Typography>
              </span>
              <Typography variant="body2" color="textSecondary" className="post-date">
              {dayjs(new Date(post.date)).format('MMM D, H:mm')}
              </Typography>
            </div>
            }
            secondary={
                <>
                    <Typography component="span" variant="body1" className="post-content">
                    {post.image ? 
                    (
                        <img className="msgBoxImg1" src={post.image} alt="image" />
                    )
                    : 
                    <span>{post.message}</span>
                    }
                        {post.message}
                    </Typography>

                    <span className="post-actions">
                        <CommentModal 
                          post={post} 
                        />
                        <IconButton 
                            onClick={(e) => { 
                                e.preventDefault(); //prevent routing to the post, which is the parent element within the PostDisplay.jsx
                                handleLike();
                            }} 
                            size="small" 
                            className="icon-button like-button"
                        >
                        <FavoriteBorder fontSize="small" />
                        <Typography component="span" variant="body2" className="postLikeCommentCount">
                            {post.likeCount}
                        </Typography>
                        </IconButton>
                    </span>
                </>
            }
        />
        </Link>
    </>
  );
};


export default PostDisplay;

