/* eslint-disable react/prop-types */
import {useState, useRef, useContext} from 'react';
import {AppStatesContext, UserContext} from '../App.jsx';
import UserAvatar from './UserAvatar.jsx';
import {Alert, Button, Box, Typography,  IconButton } from '@mui/material';
import CircularProgress, { circularProgressClasses } from '@mui/material/CircularProgress';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import CloseIcon from '@mui/icons-material/Close';
import { clean } from 'profanity-cleaner';

import ImageUploadButton from "../components/ImageUploadButton.jsx";

import '../styles/SubmitPostForm.css'
//emoji picker
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export default function SubmitPostForm({location, handleClose }) {
  const { 
    isSubmittingPost, setisSubmittingPost , pressedSubmitPost, 
    setPressedSubmitPost, darkModeOn, setImgSubmittedNavbar, setImgSubmittedHomePage
  } = useContext(AppStatesContext);

  const {currentUser} = useContext(UserContext); 

  //value in the form for submitting posts
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);

  //state for storing when the user clicks on the textarea
  const [isFocused, setIsFocused] = useState(false);

  //reference to the textarea element
  const textareaRef = useRef(null);

  // adjust the textarea height dynamically
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';  // reset the height
      textarea.style.height = `${textarea.scrollHeight}px`; // set to scroll height

    }
  };

  //max character limit
  const maxCharacters = 280;
  //character counter
  const [remainingCharacters, setRemainingCharacters] = useState(maxCharacters);

  //handle text change in form
  function handleChange(event) {
    const newValue = event.target.value;
    setValue(newValue);
    setRemainingCharacters(maxCharacters - newValue.length);
    autoResize(); //resize on every input change
  }

  //emoji select
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiSelect = (emoji) => {
    handleChange({ target: { value: value + emoji.native } });
    setShowEmojiPicker(false);
  };

  //not using useEffect for the sending posts fetch api in order to not make both homepage form and navbar form trigger at the same time
  //submit the post
  async function handleSubmit(event) {
    event.preventDefault();

    //if empty, return
    if (value === ""){
      return
    }
    
    if (isSubmittingPost || value.length > maxCharacters) {
      return
    }; // prevent multiple submissions, also prevents from submitting if above 280 characters.

    setisSubmittingPost(true); // mark submission as in progress

    try {
      const filteredPostMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' });

      const result = await fetch(import.meta.env.VITE_BACKEND_URL + '/submitPost', {
        method: "POST",
        body: JSON.stringify({ from: currentUser, date: new Date().toISOString(), message: filteredPostMessage }),
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include" // include credentials like cookies
      });

      if (result.ok) {
        await result.json();
        console.log("Posted Successfully!");
        setValue(""); // clear form after success

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


    //handle image preview and sending image

    //true when user selects an image
    const [imageSelected, setImageSelected] = useState(false);
    //manage the selected image
    const [selectedImage, setSelectedImage] = useState(null);
    //use ref to be able to select an element within a function (for activating file input in ImageUploadButton)
    const fileInputRef = useRef(null);

    //remove the selected image
    function handleRemoveImage() {
      setSelectedImage(null);
      setImageSelected(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset the file input value
      }
    }

    //function for sending the image
    function handleImgSendBtn(event) {
      event.preventDefault();
      //use two different states for posting image from navbar form and homepage form, as otherwise they clash while posting
      if (location === "navbar") {
          setImgSubmittedNavbar(true);
      } else if (location === "homepage") {
          setImgSubmittedHomePage(true);
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
  }  */

  return (
    <>
     {/* <button onClick={populate}>POPULATE</button>  */}
    <Box className="submitPost-form-container">
      <Box component="form" className="submitPost-form">
        <UserAvatar user={currentUser ? currentUser : ""} />
        {/* have different width on navbar */}
        <Box sx={{ width: "100%" }} className="submitPostFormtextAreacontainer">
          {selectedImage ? ( //conditionally render the image preview if an image is selected
            <Box className="image-preview-container">
              <img src={selectedImage} alt="Selected" className="image-preview" />
              <IconButton className="remove-image-button" onClick={handleRemoveImage}>
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <textarea
              ref={textareaRef}
              required
              className={`submitPost-input ${darkModeOn ? 'dark-mode' : ''}`}
              placeholder={location === "homepage" ? "What's on your mind?" : "Send a Post."}
              value={value}
              onChange={(e) => {
                handleChange(e);
                autoResize(); // adjust the size on input change
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          )}
          {/* //display border at the bottom of the textarea when focused */}
          <Box className={`submitPost-actions ${isFocused ? darkModeOn ? 'submitPost-actions-border-top-dark' : 'submitPost-actions-bottom-top' : ''}`}>
            <div className='submitPostFormIconContainer'>
              {/* can't remove the imageupload button render when an image is selected, otherwise the image posting logic gets interrupted */}
              <ImageUploadButton
                location={location}
                handleClose={handleClose}
                setError={setError}
                fileInputRef={fileInputRef}
                setSelectedImage={setSelectedImage} 
                imageSelected={imageSelected}
                setImageSelected={setImageSelected}
              />
              {!selectedImage && ( //conditionally render emoji button only if no image is selected
                <IconButton
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="emoji-button"
                  type="button" // prevent this button from triggering the form submission
                >
                  <SentimentSatisfiedAltIcon sx={{ color: isSubmittingPost ? "#B0B0B0" : '#1da1f2' }} />
                </IconButton>
              )}
            </div>
            <div className="characterCounterAndReplyBtnContainer">
              {!selectedImage && ( //conditionally render character counter only if no image is selected
                //character counter
                <Box sx={{ position: 'relative', display: 'inline-flex', marginLeft: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: "center" }}>
                    {/* background Circle (gray) */}
                    <CircularProgress
                      variant="determinate" 
                      value={100} // always fully rendered for the gray background
                      size={24}
                      thickness={4}
                      sx={{ color: darkModeOn ? '#424242' : '#d3d3d3' }} // gray color for unfilled part
                    />
                    {/* foreground circle (filling with blue/yellow/red) */}
                    <CircularProgress
                      variant="determinate"
                      value={100 - (remainingCharacters / maxCharacters) * 100} // filling progress based on remaining characters
                      size={24}
                      thickness={4}
                      sx={{
                        position: 'absolute', // stacking on top of the gray circle
                        left: 0,
                        color: remainingCharacters < 0 ? '#e0245e' : remainingCharacters <= 20 ? '#f5a623' : '#1da1f2', // filled part: red/yellow/blue
                        [`& .${circularProgressClasses.circle}`]: { strokeLinecap: 'round' },
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
              )}
              <Button
                variant="contained"
                type="submit" // make this button the form submission button
                onClick={selectedImage ? handleImgSendBtn : handleSubmit} // call handleImgSendBtn if an image is selected
                className="reply-button"
                disabled={remainingCharacters < 0 || isSubmittingPost}
                sx={{
                  backgroundColor: '#1da1f2',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  color: 'white',
                  textTransform: 'none',
                  borderRadius: '9999px',
                  padding: '4px 16px',
                  '&:hover': { backgroundColor: '#1a91da' },
                }}
              >
                Post
              </Button>
            </div>
          </Box>
          {showEmojiPicker && (
            <Box className="emoji-picker">
              <Picker data={data} onEmojiSelect={handleEmojiSelect} theme={darkModeOn ? "dark" : "light"} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
    {error && <Alert severity="error">{error.message}</Alert>}
  </>
);

}

