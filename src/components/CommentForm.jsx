/* eslint-disable react/prop-types */
import {useState, useEffect, useContext, useRef} from "react";
import { UserContext, AppStatesContext } from '../App.jsx';
import UserAvatar from './UserAvatar.jsx';
import {Typography, IconButton, Button, Box} from '@mui/material';
import CircularProgress, { circularProgressClasses } from '@mui/material/CircularProgress';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
//emoji picker
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

import { clean } from 'profanity-cleaner';
import '../styles/CommentForm.css'

const CommentForm = ({post, handleClose}) => {

  
  //Pass the UserContext defined in app.jsx
  const { currentUser} = useContext(UserContext); 

  const {refreshPosts, setRefreshPosts, darkModeOn} = useContext(AppStatesContext); 

  const [value, setValue] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [clickedPostComment, setClickedPostComment] = useState(false); // state to toggle form visibility

  //state for storing when the user clicks on the textarea
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef(null);

  //adjust the textarea height dynamically
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';  //reset the height
      textarea.style.height = `${textarea.scrollHeight}px`; //set to scroll height

    }
  };

  //character counter
  const maxCharacters = 280;
  const [remainingCharacters, setRemainingCharacters] = useState(maxCharacters);
  function handleChange(event) {
    const newValue = event.target.value;
    setValue(newValue);
    setRemainingCharacters(maxCharacters - newValue.length);
    autoResize(); // resize on every input change
  }


  const handleEmojiSelect = (emoji) => {
    handleChange({ target: { value: value + emoji.native } });
    setShowEmojiPicker(false);
  };

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



  //handle submitting comments on posts
  useEffect(() => {
    async function sendCommentonPost() {

      if (value.length > maxCharacters) return; //prevent from submitting if above 280 characters.

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
          setValue("")
          setRefreshPosts(!refreshPosts)
        } else{
          throw new Error(result)
        }
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setClickedPostComment(false)
      });
    }
    //only trigger when comment is posted
    if (clickedPostComment ===true){
        sendCommentonPost();
    } 
  }, [clickedPostComment]);






  return (
    <Box component="form" className=  
        {`
        comment-form-container 
        ${darkModeOn ? 'dark-mode' : ''} 
        ` }>
      <UserAvatar
        user={currentUser}
      />
      <Box sx={{ flexGrow: 1 }}>
        <textarea
          ref={textareaRef} 
          required
          //if dark theme on, add dark-theme class
          className={`comment-input ${darkModeOn ? 'dark-mode' : ''}`}
          placeholder="Post your comment."
          value={value}
          onChange={(e) => {
            handleChange(e);  
            autoResize();  //adjust the size on input change
          }}
          onFocus={() => setIsFocused(true)}  
          onBlur={() => setIsFocused(false)} 
        />
        <Box 
        className={`
          comment-actions 
          ${isFocused ?  //display border at the bottom of the textarea when focused
              darkModeOn ?
              'comment-actions-border-top-dark' 
              : 
              'comment-actions-bottom-top'
            :
            ''}` }
        >
          <IconButton
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="emoji-button"
            type="button" // prevent this button from triggering the form submission
          >
            <SentimentSatisfiedAltIcon sx={{ color: '#1da1f2' }} />

          </IconButton>
          <div className="characterCounterAndReplyBtnContainer">
            {/* character counter */}
            <Box sx={{ position: 'relative', display: 'inline-flex', marginLeft: 2 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: "center"}}>
                {/* background Circle (gray) */}
                <CircularProgress
                  variant="determinate"
                  value={100} // always fully rendered for the gray background
                  size={24}
                  thickness={4}
                  sx={{
                    color: darkModeOn ? '#424242' : '#d3d3d3', //gray color for unfilled part
                  }}
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
              onClick={handleSendClick}
              className="reply-button"
              disabled={remainingCharacters<0}
              sx={{
                backgroundColor: '#1da1f2',
                fontWeight: 'bold',
                fontSize: '15px',
                color: 'white',
                textTransform: 'none',
                borderRadius: '9999px',
                padding: '4px 16px', // 
                '&:hover': {
                  backgroundColor: '#1a91da',
                },
              }}
            >
              Reply
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
  );
};

export default CommentForm;