import React, { useState, useEffect, useContext } from "react";
import { UserContext } from '../App.jsx';
import { clean } from 'profanity-cleaner';
import '../styles/CommentForm.css'

const CommentForm = ({postID}) => {


  //Pass the UserContext defined in app.jsx
  const { currentUser, selectedUser, setSelectedUser } = useContext(UserContext); 




  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  const [value, setValue] = useState()
  const [clickedPostComment, setClickedPostComment] = useState(false);

  const handleCommentClick = () => {
    setShowForm(!showForm); // Toggle form visibility
  };

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
          //on submit, clean the words with the profanity cleaner package
          //https://www.npmjs.com/package/profanity-cleaner
          let filteredCommentMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' }) 
    
          await fetch(import.meta.env.VITE_BACKEND_URL+'/sendCommentonPost', {
            method: "post",
            // store date as isostring to make the reading easier later
            body: JSON.stringify({ from:currentUser, toPostID:postID , date: new Date().toISOString(), comment: filteredCommentMessage}), 
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
    <div>
      <button onClick={handleCommentClick}>
        {showForm ? "Hide" : "Comment"}
      </button>

      <div className={`comment-form ${showForm ? "show" : ""}`}>
        <textarea value={value} onChange={handleChange} className="commentFormTextarea" placeholder="Enter your comment..." />
        <button className="commentFormBtn" onClick={handleSendClick}>Send</button>
      </div>
    </div>
  );
};

export default CommentForm;