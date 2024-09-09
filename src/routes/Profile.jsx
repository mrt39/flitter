/* eslint-disable react/prop-types */
import { useOutletContext, useLocation, Link, useNavigate} from "react-router-dom";
import { useState, useContext, useEffect } from 'react'
import { UserContext } from '../App.jsx';
import React from 'react';
import dayjs from 'dayjs';
import { Card, CardContent, Typography, Button, Avatar } from '@mui/material';
import { CircularProgress, Alert } from '@mui/material';
import "../styles/Profile.css"
import CommentForm from "../components/CommentForm.jsx";
import UserCardProfile from "../components/UserCardProfile.jsx";
//imports for generating the url path for routing 
import slugify from 'slugify';




const Profile = () => {

  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated, allPosts, setAllPosts, handleLike, pressedLikePost, imgSubmitted, setImgSubmitted, pressedSubmitPost, setPressedSubmitPost ] = useOutletContext();
  // Pass the UserContext defined in app.jsx
  const { currentUser, selectedUser, setSelectedUser } = useContext(UserContext); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); 


    //get the last 8 characters of current url (which is the assigned shortid for the selectedUser)
    const location = useLocation();
    // Get the pathname from the location object
    const currentPath = location.pathname;
    // Extract the last 8 characters
    const last8Chars = currentPath.slice(-8);


  //need to make a profile call because the selectedUser state will empty once the user refreshes the page
  //fetch for getting data of the user, based on their shortId
  useEffect(() => {
    const getUserData = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/profile-shortId/'+last8Chars, {
      method: 'GET',
      })
      .then(response => {
          if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          setSelectedUser(data[0])
          console.log(data[0])
          setLoading(false)
      })
      .catch(error => {
          setError(error.message);
          setLoading(false)
          console.error('Error:', error);
      });
    };
    getUserData();
    }, []);






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



  if (loading) {
    return <CircularProgress />;
  }



  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  
  return (
    <>
    <div className="profileContainer">
      
      <UserCardProfile
      currentUser = {currentUser}
      selectedUser = {selectedUser}
      setSelectedUser = {setSelectedUser}
      />

    <br /><br /> <br /><br /> <br /><br />
      <h2>
       ALL POSTS
      </h2>
      <ul>
      {allPosts.map((post) => (
        //only display posts from this profile
        post.from[0]._id ===selectedUser._id
        ? 
          <li key={post._id}>
              <Link onClick={() => handleProfileRouting(post.from[0])}>
                <h3>
                  {post.from[0].name}
                </h3>
              </Link>
              {post.message? 
                <p>
                  {post.message}
                </p>
              :""}
              {post.image? 
                <p>
                  <img className="msgBoxImg1" src={post.image} alt="image" />
                </p>
              :""}
              <p>{dayjs(new Date(post.date)).format('MMM D, H:mm')}</p>
              {/* <p>{dayjs(post.date).format('MMMM D, YYYY h:mm A')}</p> */}
              <button onClick={()=>handleLike(post._id)}>Like Post</button>
              <p>Likes: {post.likeCount}</p>
              <CommentForm 
              postID={post._id}
              />
              <p>Comments: {post.commentCount}</p>
              <br />
              <p>Comment Section of This post:</p>
              <ul>
                {/* if exists, post the comments of this post */}
              {post.comments ?
              post.comments.map((comment) => (
              <li key={comment.id}>
                <p>{comment.comment}</p>
                <p>{comment.date}</p>
                <h4>{comment.from[0].name}</h4>
              </li>
              ))
              :""}
              </ul>
              <br /> <br /> <br />
          </li>
        : 
        null
        ))}
      </ul>

    </div>
    </>


  );
};


export default Profile;

