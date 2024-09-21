/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from "react";
import {  Typography,  IconButton } from '@mui/material';
import {  ChatBubbleOutline } from '@mui/icons-material';
import { TextField, Avatar, Button, Box  } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

import { UserContext, AppStatesContext } from '../App.jsx';
import { clean } from 'profanity-cleaner';
import '../styles/CommentForm.css'

const CommentForm = ({post, handleClose}) => {

  
  //Pass the UserContext defined in app.jsx
  const { currentUser} = useContext(UserContext); 

  const {refreshPosts, setRefreshPosts, darkModeOn} = useContext(AppStatesContext); 

  const [value, setValue] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [clickedPostComment, setClickedPostComment] = useState(false); // State to toggle form visibility

  // Max character limit
  const maxCharacters = 280;

  const handleEmojiSelect = (emoji) => {
    handleChange({ target: { value: value + emoji.native } });
    setShowEmojiPicker(false);
  };

  function handleChange(event){
    setValue(event.target.value)
  }

  const handleSendClick = (event) => {
    if (value === ""){
      return
    }
    event.preventDefault();
    setClickedPostComment(true)
    //if form is opened through modal, close the modal
    if (handleClose){
      handleClose()
    }
  };



  //useeffect to handle submitting blog posts
  useEffect(() => {
    async function sendCommentonPost() {

      if (value.length > maxCharacters) return; // Prevent from submitting if above 280 characters.

      //on submit, clean the words with the profanity cleaner package
      //https://www.npmjs.com/package/profanity-cleaner
      let filteredCommentMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' }) 

      await fetch(import.meta.env.VITE_BACKEND_URL+'/sendCommentonPost', {
        method: "POST",
        // store date as isostring to make the reading easier later
        body: JSON.stringify({ from:currentUser, toPostID:post._id , date: new Date().toISOString(), comment: filteredCommentMessage}), 
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
        credentials:"include" //required for sending the cookie data-authorization check
    })
      .then(async result => {
        if (result.ok){
          await result.json();
          console.log("Commented on the Succesfully!")
          setClickedPostComment(false)
          setValue("")
          setRefreshPosts(!refreshPosts)
        } else{
          throw new Error(result)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setClickedPostComment(false)
      }); 
    }
    //only trigger when comment is posted
    if (clickedPostComment ===true){
        sendCommentonPost();
    } 
  }, [clickedPostComment]);






  return (
    <Box component="form" /* onSubmit={handleSendClick} */ className="comment-form-container">
      <Avatar
        alt="User Avatar"
        src={currentUser.picture || currentUser.uploadedpic}
        sx={{ marginRight: 2 }}
        className="comment-avatar"
      />
      <Box sx={{ flexGrow: 1 }}>
        <textarea
          required
          className="comment-input"
          placeholder="Post your comment."
          value={value}
          onChange={handleChange}
        />
        <Box className="comment-actions">
          <IconButton
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="emoji-button"
            type="button" // Prevent this button from triggering the form submission
          >
            <SentimentSatisfiedAltIcon sx={{ color: '#1da1f2' }} />

          </IconButton>
          <Button
            variant="contained"
            type="submit" // Make this button the form submission button
            onClick={handleSendClick}
            className="reply-button"
            sx={{
              backgroundColor: '#1da1f2',
              color: 'white',
              textTransform: 'none',
              borderRadius: '9999px',
              padding: '4px 16px', // Adjusted padding for a more compact button
              fontWeight: 'bold', // Make text bold
              '&:hover': {
                backgroundColor: '#1a91da',
              },
            }}
          >
            Reply
          </Button>
        </Box>
        {showEmojiPicker && (
          <Box className="emoji-picker">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} theme={darkModeOn? "dark": "light"} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CommentForm;