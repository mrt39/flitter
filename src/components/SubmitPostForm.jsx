/* eslint-disable react/prop-types */
import {useState, useEffect, useRef, useContext} from 'react';
import {AppStatesContext, UserContext} from '../App.jsx';
import UserAvatar from './UserAvatar.jsx';
import { Alert } from '@mui/material';
import { TextField, Avatar, Button, Box, Typography,  IconButton } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera'; 
import CircularProgress, { circularProgressClasses } from '@mui/material/CircularProgress';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { clean } from 'profanity-cleaner';


import ImageUploadButton from "../components/ImageUploadButton.jsx";


import '../styles/SubmitPostForm.css'


import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function SubmitPostForm({location, handleClose }) {
  const { 
    setSnackbarOpenCondition, setSnackbarOpen, isSubmittingPost, 
    setisSubmittingPost , pressedSubmitPost, setPressedSubmitPost, 
    imgSubmittedNavbar, setImgSubmittedNavbar, imgSubmittedHomePage, 
    setImgSubmittedHomePage, darkModeOn
  } = useContext(AppStatesContext);

  const {currentUser} = useContext(UserContext); 


  //value in the form for submitting posts
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);


  //state for storing when the user clicks on the textarea
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef(null);

  // Adjust the textarea height dynamically
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';  // Reset the height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height

    }
  };

  // Max character limit
  const maxCharacters = 280;
  // Character counter
  const [remainingCharacters, setRemainingCharacters] = useState(maxCharacters);

  // Handle text change in form
  function handleChange(event) {
    const newValue = event.target.value;
    setValue(newValue);
    setRemainingCharacters(maxCharacters - newValue.length);
    autoResize(); // Resize on every input change
  }

  //emoji select
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = (emoji) => {
    handleChange({ target: { value: value + emoji.native } });
    setShowEmojiPicker(false);
  };


  //not using useEffect for the sending posts fetch api in order to not make both homepage form and navbar form trigger at the same time
  // Submit the post
  async function handleSubmit(event) {
    event.preventDefault();

    //if empty, return
    if (value === ""){
      return
    }
    
    if (isSubmittingPost || value.length > maxCharacters) {
      return
    }; // Prevent multiple submissions, also prevents from submitting if above 280 characters.

    setisSubmittingPost(true); // Mark submission as in progress

    try {
      const filteredPostMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' });

      const result = await fetch(import.meta.env.VITE_BACKEND_URL + '/submitPost', {
        method: "POST",
        body: JSON.stringify({ from: currentUser, date: new Date().toISOString(), message: filteredPostMessage }),
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include" // Include credentials like cookies
      });

      if (result.ok) {
        await result.json();
        console.log("Posted Successfully!");
        setValue(""); // Clear form after success

        // Close modal if used in the navbar
        if (location === 'navbar' && handleClose) {
          handleClose();
        }
      } else {
        throw new Error(result);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error);
    } finally {
      setisSubmittingPost(false); // Reset submission state
      setPressedSubmitPost(!pressedSubmitPost)
    }
  }


  //function for populating db with post data

/*   async function populate(){
    try {
      const result = await fetch(import.meta.env.VITE_BACKEND_URL + '/populate', {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
          },
          credentials: "include" // Include credentials like cookies
      });

      if (result.ok) {
          await result.json();
          console.log("Populated successfully!");
      } else {
          throw new Error(result);
      }
      } catch (error) {
          console.error('Error:', error);
          setError(error);
      } 
  } */


  return (
    <>
    {/* <button onClick={populate}>POPULATE</button> */}


    <Box className="submitPost-form-container">

    <Box component="form" className="submitPost-form">
    
      <UserAvatar
        user={currentUser? currentUser: ""}
      />
      {/* have different width on navbar */}
      <Box sx={{ width: "100%" }} className="submitPostFormtextAreacontainer">
        <textarea
          ref={textareaRef} 
          required
          //if dark theme on, add dark-theme class
          className={`
            submitPost-input 
            ${darkModeOn ? 'dark-mode' : ''} 
            ` } 
          placeholder={location === "homepage"?"What's on your mind?": "Send a Post."}
          value={value}
          onChange={(e) => {
            handleChange(e);  
            autoResize();     // Adjust the size on input change
          }}
          onFocus={() => setIsFocused(true)}  
          onBlur={() => setIsFocused(false)}   
        />
        

        <Box className={`
            submitPost-actions 
            ${isFocused ?  //display border at the bottom of the textarea when focused
                darkModeOn ?
                'submitPost-actions-border-top-dark' 
                : 
                'submitPost-actions-bottom-top'
              :
              ''}` } >
          <div className='submitPostFormIconContainer'>
            <ImageUploadButton
              location={location} 
              handleClose={handleClose}
              setError={setError}
            />
            <IconButton
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="emoji-button"
              type="button" // Prevent this button from triggering the form submission
            >
              <SentimentSatisfiedAltIcon sx={{ color: isSubmittingPost? "#B0B0B0":'#1da1f2' }} />

            </IconButton>
          </div>

          <div className="characterCounterAndReplyBtnContainer">
            {/* character counter */}
            <Box sx={{ position: 'relative', display: 'inline-flex', marginLeft: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: "center"}}>
                {/* Background Circle (Gray) */}
                <CircularProgress
                  variant="determinate"
                  value={100} // Always fully rendered for the gray background
                  size={24}
                  thickness={4}
                  sx={{
                    color: darkModeOn ? '#424242' : '#d3d3d3', // Gray color for unfilled part
                  }}
                />
                
                {/* Foreground Circle (Filling with Blue/Yellow/Red) */}
                <CircularProgress
                  variant="determinate"
                  value={100 - (remainingCharacters / maxCharacters) * 100} // Filling progress based on remaining characters
                  size={24}
                  thickness={4}
                  sx={{
                    position: 'absolute', // Stacking on top of the gray circle
                    left: 0,
                    color: remainingCharacters < 0 ? '#e0245e' : remainingCharacters <= 20 ? '#f5a623' : '#1da1f2', // Filled part: red/yellow/blue
                    [`& .${circularProgressClasses.circle}`]: {
                      strokeLinecap: 'round',
                    },
                  }}
                />
              </Box>
              {remainingCharacters < 20 && (
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: remainingCharacters < 0 ? '#e0245e' : 'inherit',
                  }}
                >
                  {remainingCharacters}
                </Typography>
              )}
          </Box>
          <Button
              variant="contained"
              type="submit" // make this button the form submission button
              onClick={handleSubmit}
              className="reply-button"
              disabled={remainingCharacters<0 ||isSubmittingPost}
              sx={{
                backgroundColor: '#1da1f2',
                fontWeight: 'bold',
                fontSize: '15px',
                color: 'white',
                textTransform: 'none',
                borderRadius: '9999px',
                padding: '4px 16px', 
                '&:hover': {
                  backgroundColor: '#1a91da',
                },
              }}
            >
              Post
          </Button>
        </div>
        </Box>
        {showEmojiPicker && (
          <Box className="emoji-picker">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} theme={darkModeOn? "dark": "light"} />
          </Box>
        )}
      </Box>
    </Box>
    </Box>




      {error && <Alert severity="error">{error.message}</Alert>}
    </>
  );
}