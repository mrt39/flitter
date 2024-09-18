/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from "react";
import {  Typography,  IconButton } from '@mui/material';
import {  ChatBubbleOutline } from '@mui/icons-material';

import { UserContext } from '../App.jsx';
import { clean } from 'profanity-cleaner';
import '../styles/CommentForm.css'

const CommentForm = ({post, clickedPostComment, setClickedPostComment}) => {

  
  //Pass the UserContext defined in app.jsx
  const { currentUser} = useContext(UserContext); 




  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  const [value, setValue] = useState("")

  const handleCommentClick = () => {
    setShowForm(!showForm); // Toggle form visibility
  };

  // Max character limit
  const maxCharacters = 280;

  function handleChange(event){
    setValue(event.target.value)
  }

  const handleSendClick = () => {
    setShowForm(false); // Hide form after sending
    setClickedPostComment(true)
  };



    //useeffect to handle submitting blog posts
    useEffect(() => {
        async function sendCommentonPost() {

          if (value.length > maxCharacters) return; // Prevent from submitting if above 280 characters.

          //on submit, clean the words with the profanity cleaner package
          //https://www.npmjs.com/package/profanity-cleaner
          let filteredCommentMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' }) 
    
          await fetch(import.meta.env.VITE_BACKEND_URL+'/sendCommentonPost', {
            method: "post",
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
    <>
        <textarea 
        value={value} 
        onChange={handleChange} 
        className="commentFormTextarea" 
        placeholder="Enter your comment..." 
        style={{ borderColor: value.length > maxCharacters ? 'red' : '' }} 
        />
        {/* Character Counter */}
        <div style={{ color: value.length > maxCharacters ? 'red' : '' }}>
        {value.length}/{maxCharacters}
        </div>
        <button 
        className="commentFormBtn" 
        onClick={handleSendClick}
        disabled={value.length > maxCharacters}         
        >
          Send
        </button>
    </>
  );
};

export default CommentForm;