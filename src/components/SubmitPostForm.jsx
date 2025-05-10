/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import { Box, Button, IconButton, Alert, Typography, CircularProgress } from '@mui/material';
import { circularProgressClasses } from '@mui/material/CircularProgress';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import CloseIcon from '@mui/icons-material/Close';
//emoji picker
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { clean } from 'profanity-cleaner';
import UserAvatar from './UserAvatar.jsx';
import ImageUploadButton from './ImageUploadButton.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import { usePost } from '../contexts/PostContext.jsx';
import { submitPost } from '../utilities/postService.js';
import '../styles/SubmitPostForm.css';

export default function SubmitPostForm({location, handleClose, onSubmitStart, onSubmitEnd}) {
  const { isSubmittingPost, setisSubmittingPost, pressedSubmitPost, 
    setPressedSubmitPost, setImgSubmittedNavbar, setImgSubmittedHomePage } = usePost();
  const { currentUser } = useAuth();
  const { darkModeOn } = useUI();

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
      textarea.style.height = 'auto';  // Reset height to auto to get the correct scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`;  // Set height to the scrollHeight
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
    if (value === "") {
      return;
    }
    
    if (isSubmittingPost || value.length > maxCharacters) {
      return;
    } // prevent multiple submissions, also prevents from submitting if above 280 characters.

    setisSubmittingPost(true); // mark submission as in progress

    //notify parent component that submission has started, for css change during post submission.
    if (onSubmitStart) {
      onSubmitStart();
    }

    try {
      //on submit, clean the words with the profanity cleaner package
      //https://www.npmjs.com/package/profanity-cleaner
      let filteredMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' });
      
      await submitPost(currentUser, filteredMessage);
      
      console.log("Post Submitted Successfully!");
      setValue(""); // Reset the input field
      
      // Set state to trigger a re-fetch in AllPostsDisplay.jsx
      setPressedSubmitPost(prevState => !prevState);
    } catch (error) {
      console.error('Error:', error);
      setError(error);
    } finally {
      setisSubmittingPost(false); //rset submission state

      //notify parent component that submission has ended
      if (onSubmitEnd) {
        onSubmitEnd();
      }

      //if the post was submitted from the navbar modal, close it
      if (location === "navbar" && handleClose) {
        handleClose();
      }
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
      fileInputRef.current.value = null; //reset the file input
    }
  }

  //function for sending the image
  function handleImgSendBtn(event) {
    event.preventDefault();

    //notify parent component that submission has started, for css change during post submission
    if (onSubmitStart) {
      onSubmitStart();
    }

    //use two different states for posting image from navbar form and homepage form, as otherwise they clash while posting
    if (location === "navbar") {
      setImgSubmittedNavbar(true);
      
      //if there's a handleClose function, use it
      if (handleClose) {
        handleClose();
      }
    } else {
      setImgSubmittedHomePage(true);
    }
  }

 return (
    <>
      <Box className="submitPost-form-container">
        <Box component="form" className="submitPost-form">
          <UserAvatar user={currentUser ? currentUser : ""} />
          {/* have different width on navbar */}
          <Box sx={{ width: "100%" }} className="submitPostFormtextAreacontainer">
            {selectedImage ? ( //conditionally render the image preview if an image is selected
              <Box className="image-preview-container">
                <img src={selectedImage} alt="Selected" className="image-preview" />
                <IconButton 
                  className="remove-image-button" 
                  onClick={handleRemoveImage}
                  disabled={isSubmittingPost}
                >
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
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isSubmittingPost}
              />
            )}
            
            <Box className={`submitPost-actions ${isFocused ? darkModeOn ? 'submitPost-actions-border-top-dark' : 'submitPost-actions-bottom-top' : ''}`}>
              <div className='submitPostFormIconContainer'>
                <ImageUploadButton
                  location={location}
                  handleClose={handleClose}
                  setError={setError}
                  fileInputRef={fileInputRef}
                  setSelectedImage={setSelectedImage} 
                  imageSelected={imageSelected}
                  setImageSelected={setImageSelected}
                  disabled={isSubmittingPost}
                />
                {!selectedImage && (
                  <IconButton
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="emoji-button"
                    type="button"
                    disabled={isSubmittingPost}
                  >
                    <SentimentSatisfiedAltIcon sx={{ color: isSubmittingPost ? "#B0B0B0" : '#1da1f2' }} />
                  </IconButton>
                )}
              </div>
              <div className="characterCounterAndReplyBtnContainer">
                {!selectedImage && (
                  <Box sx={{ position: 'relative', display: 'inline-flex', marginLeft: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: "center" }}>
                      <CircularProgress
                        variant="determinate" 
                        value={100}
                        size={24}
                        thickness={4}
                        sx={{ color: darkModeOn ? '#424242' : '#d3d3d3' }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={100 - (remainingCharacters / maxCharacters) * 100}
                        size={24}
                        thickness={4}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          color: remainingCharacters < 0 ? '#e0245e' : remainingCharacters <= 20 ? '#f5a623' : '#1da1f2',
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
                  type="submit"
                  onClick={selectedImage ? handleImgSendBtn : handleSubmit}
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
            {showEmojiPicker && !isSubmittingPost && (
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