/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from 'react';
import { AppStatesContext } from '../App.jsx';
import FileInputPopover from "../components/Popover.jsx";
import { Alert } from '@mui/material';
import { TextField, Avatar, Button, Box, Typography,  IconButton } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PhotoCamera from '@mui/icons-material/PhotoCamera'; 
import CircularProgress, { circularProgressClasses } from '@mui/material/CircularProgress';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { clean } from 'profanity-cleaner';

import '../styles/SubmitPostForm.css'


import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function SubmitPostForm({ currentUser, location, handleClose }) {
  const { 
    setSnackbarOpenCondition, setSnackbarOpen, isSubmittingPost, 
    setisSubmittingPost , pressedSubmitPost, setPressedSubmitPost, 
    imgSubmittedNavbar, setImgSubmittedNavbar, imgSubmittedHomePage, 
    setImgSubmittedHomePage, darkModeOn
  } = useContext(AppStatesContext);

  //value in the form for submitting posts
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);


    // Max character limit
    const maxCharacters = 280;
    // Character counter
    const [remainingCharacters, setRemainingCharacters] = useState(maxCharacters);

  // Handle text change in form
  function handleChange(event) {
    const newValue = event.target.value;
    setValue(newValue);
    setRemainingCharacters(maxCharacters - newValue.length);
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








   /* ---------------IMAGE HANDLING FUNCTIONALITY--------------- */

    //use ref to be able to select an element within a function (for displaying popover)
    const fileInputRef = useRef(null);

    //anchor for popover
    const [popOveranchorEl, setPopOverAnchorEl] = useState(null);
  
  
    const [imageFile, setImageFile] = useState(null);

    //trigger when user selects an image
    const [imageSelected, setImageSelected] = useState(false);


    //when the attachment icon is clicked, click on the hidden input (type=file) element
    function handleAttachmentClick() {
        fileInputRef.current.click(); // Trigger file input
    }

    //when user selects an image and changes the value of the input, change the state 
    function handleFileInputChange(event){
        const selectedFile = event.target.files;
        //check the filetype to ensure it's an image. throw error if it isn't
        if (selectedFile[0]["type"] != "image/x-png" && selectedFile[0]["type"] != "image/png" && selectedFile[0]["type"] != "image/jpeg") {
          console.error("Only image files can be attached!")
          setSnackbarOpenCondition("notAnImage")
          setSnackbarOpen(true)
          return
          //if image size is > 1mb, throw error
        }else if(selectedFile[0]["size"] > 1048576){
          console.error("Image size is too big!")
          setSnackbarOpenCondition("sizeTooBig")
          setSnackbarOpen(true)
          return
        }else{
          setImageSelected(true)
          setImageFile(selectedFile[0]);
        }
      }


    //when an image is selected, activate the popover
    useEffect(() => {
        //only trigger if an image is selected
        if (imageSelected){
          var attachmentIcon = null
          // select the attachment button next to the message input box and make it the anchor for the popover to be displayed over
          // if the image is selected from navbar, attach the button to navbar. if from homepage, attach it to homepage.
          {location === 'navbar' ? 'sendAnImgButtonNavbar' : "sendAnImgButtonHomepage"}
          if (document.querySelector('#sendAnImgButtonNavbar')){
            attachmentIcon = document.querySelector('#sendAnImgButtonNavbar')
          } else {
            attachmentIcon = document.querySelector('#sendAnImgButtonHomepage')
          }
          setPopOverAnchorEl(attachmentIcon)
        }
    }, [imageSelected]);


    //function for sending the image
    function handleImgSendBtn() {
        //use two different states for posting image from navbar form and homepage form, as otherwise they clash while posting
        if (location === "navbar") {
            setImgSubmittedNavbar(true);
        } else if (location === "homepage") {
            setImgSubmittedHomePage(true);
        }
    }

// Effect for sending image
useEffect(() => {
    if (isSubmittingPost) return; // Prevent multiple submissions

    async function sendImage() {
        setisSubmittingPost(true); // Mark submission as in progress
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("from", JSON.stringify({ currentUser }));
        formData.append("date", JSON.stringify(new Date().toISOString()));  // Stringify 'date'

        try {
            const result = await fetch(import.meta.env.VITE_BACKEND_URL + '/imagesent', {
                method: "POST",
                //if imageFile exists, send imageFile  
                body: formData,
                credentials: "include" // Include credentials like cookies
            });

            if (result.ok) {
                await result.json();
                console.log("Image sent successfully!");
                setImageFile(null);
            } else {
                throw new Error(result);
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error);
        } finally {
            setisSubmittingPost(false); // Reset submission state
            if (location === "navbar") {
                setImgSubmittedNavbar(false);
                if (handleClose) handleClose();
            } else if (location === "homepage") {
                setImgSubmittedHomePage(false);
            }
        }
    }

    if (location === "navbar" && imgSubmittedNavbar === true) {
        sendImage();
    } else if (location === "homepage" && imgSubmittedHomePage === true) {
        sendImage();
    }
}, [imgSubmittedNavbar, imgSubmittedHomePage]);



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
          //if dark theme on, add dark-theme class
          className={`comment-input ${darkModeOn ? 'dark-theme' : ''}`}
          placeholder={location === "homepage"?"What's on your mind?": "Send a Post."}
          value={value}
          onChange={handleChange}
        />
        <Box className="comment-actions">
          <div className='submitPostFormIconContainer'>
              <IconButton 
              id={location === 'navbar' ? 'sendAnImgButtonNavbar' : "sendAnImgButtonHomepage"} 
              onClick={handleAttachmentClick} 
              disabled={isSubmittingPost}
              aria-label="upload picture"
              component="label"
            >
              <ImageOutlinedIcon sx={{ color: '#1da1f2' }} /> 
            </IconButton>
            <IconButton
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="emoji-button"
              type="button" // Prevent this button from triggering the form submission
            >
              <SentimentSatisfiedAltIcon sx={{ color: '#1da1f2' }} />

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
              type="submit" // Make this button the form submission button
              onClick={handleSubmit}
              className="reply-button"
              disabled={remainingCharacters<0}
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





{/*       <IconButton 
        id={location === 'navbar' ? 'sendAnImgButtonNavbar' : "sendAnImgButtonHomepage"} 
        onClick={handleAttachmentClick} 
        disabled={isSubmittingPost}
        aria-label="upload picture"
        component="label"
      >
        <ImageIcon /> 
      </IconButton> */}
      {/* hidden file input */}
      <input 
        ref={fileInputRef} 
        type='file' 
        accept="image/*" 
        className='fileInputMessageBox' 
        onChange={handleFileInputChange} 
        disabled={isSubmittingPost}
        style={{ display: 'none' }} // Hide the input
      />
      
      <FileInputPopover
        popOveranchorEl={popOveranchorEl}
        imgSubmittedHomePage={imgSubmittedHomePage}
        imgSubmittedNavbar = {imgSubmittedNavbar}
        setPopOverAnchorEl={setPopOverAnchorEl}
        setImageSelected={setImageSelected}
        handleImgSendBtn={handleImgSendBtn}
      />



      {error && <Alert severity="error">{error.message}</Alert>}
      <div className={darkModeOn? 'submitPostFormSeperator-darkMode': "submitPostFormSeperator"}></div>
    </>
  );
}