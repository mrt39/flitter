/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import CommentModal from './CommentModal.jsx';
import UserAvatar from './UserAvatar.jsx';
import { UserContext, AppStatesContext} from '../App.jsx';
import { Avatar } from '@mui/material';
import { ListItemText,  ListItemAvatar} from '@mui/material';
import {  Typography,  IconButton,  } from '@mui/material';
import { FavoriteBorder} from '@mui/icons-material';

//import for generating the url path for routing 
import slugify from 'slugify';
import '../styles/CommentDisplay.css'


const CommentDisplay = ({comment}) => {

    //Pass the UserContext defined in app.jsx
    const { currentUser, setSelectedUser } = useContext(UserContext); 

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


    return (
      <>
        <span 
            className="usernameLinkOnComment" 
            onClick={(e) => 
                { 
                e.preventDefault();
                handleProfileRouting(comment.from[0] //route to profile instead
                )}}
        >
            <ListItemAvatar>
            <UserAvatar
                    user={comment.from[0]}
                    source="post"
      		  />
            </ListItemAvatar>
        </span>
        <ListItemText
            primary={
            <div className="comment-header">
              <span 
                  className="usernameLinkOnComment" 
                  onClick={(e) => 
                        { 
                        e.preventDefault();
                        handleProfileRouting(comment.from[0] //route to profile instead
                        )}}
              >
                <Typography variant="subtitle1" className="comment-name">
                {comment.from[0].name}
                </Typography>
              </span>
              <Typography variant="body2" color="textSecondary" className="comment-date">
              {dayjs(new Date(comment.date)).format('MMM D, H:mm')}
              </Typography>
            </div>
            }
            secondary={
                <>
                    <Typography component="span" variant="body1" className="comment-content">
                        {comment.comment}
                    </Typography>
                </>
            }
        />

      </>
    );
  };
  
  export default CommentDisplay;