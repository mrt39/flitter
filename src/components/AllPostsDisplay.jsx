/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import CommentModal from './CommentModal.jsx';
import PostDisplay from './PostDisplay.jsx';
import { UserContext, AppStatesContext } from '../App.jsx';
import Box from '@mui/material/Box';
import { CircularProgress, Alert, Avatar } from '@mui/material';
import { TextField, Button, List, ListItem, ListItemText, Paper, ListItemAvatar} from '@mui/material';
import {  Card, CardContent, Typography,  IconButton, Divider } from '@mui/material';
import { FavoriteBorder, ChatBubbleOutline } from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/CommentOutlined';

//imports for generating the url path for routing 
import slugify from 'slugify';
//infinite scroll 
import InfiniteScroll from 'react-infinite-scroll-component';
import '../styles/AllPostsDisplay.css'



const AllPostsDisplay = ({fromThisUser}) => {

  //Pass the UserContext defined in app.jsx
  const { currentUser, setSelectedUser } = useContext(UserContext); 

  const { allPosts, setAllPosts, imgSubmittedNavbar, imgSubmittedHomePage, pressedSubmitPost, refreshPosts, darkModeOn} = useContext(AppStatesContext); 

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  //handle liking the posts
  const [likepostID, setLikePostID] = useState("")
  const [pressedLikePost, setPressedLikePost] = useState(false)



  const [filteredMessages, setFilteredMessages] = useState([])

  // Control shuffling. 
  //Create this variable to prevent the homepage AllPostsDisplay from shuffling posts when the user likes or comments on a post.
  const [shouldNotShuffle, setShouldNotShuffle] = useState(false); 

  


  //fetch for getting data of all posts
  useEffect(() => {
    const getMessages = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/getallposts', {
      method: 'GET',
      })
      .then(response => {
          if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          //sort data by dates, descending order
          data.sort((post1,post2) => (post1.date < post2.date) ? 1 : ((post2.date < post1.date) ? -1 : 0))
          setAllPosts(data)
          setLoading(false)
      })
      .catch(error => {
          setError(error.message);
          console.error('Error:', error);
          setLoading(false)
      });
    };
    getMessages();
    //should shuffle by default
    setShouldNotShuffle(false)
    }, [pressedSubmitPost, imgSubmittedNavbar, imgSubmittedHomePage, refreshPosts]); 




      


    //useffect for sorting messages
    useEffect(() => {
    async function sortMessageDisplay(){
      var filteredMessages = []
      //if fromThisUser exists (rendering /profile route), only get the messages from that user, display chronologically
      if (fromThisUser){
        allPosts.forEach((post) => {
          // Check if the post is from this user
          if (post.from[0]._id === fromThisUser._id) {
            // Push the post into filteredMessages array
            filteredMessages.push(post);
          }
        });
        
        // Sort filteredMessages array by date 
        filteredMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
      }else{ //if fromThisUser does not exist (rendering home route), get all the messages, display randomly
        filteredMessages = allPosts
        //randomize the posts
        for (var i = filteredMessages.length - 1; i >= 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = filteredMessages[i];
          filteredMessages[i] = filteredMessages[j];
          filteredMessages[j] = temp;
        }
      }
      setFilteredMessages(filteredMessages)
    }

    sortMessageDisplay()

  }, [allPosts]);

  
  /* ---------------------------INFINITE SCROLL FUNCTIONALITY--------------------------- */
  //state for setting the visible post count, for infinite scroll functionality 
  const [visiblePosts, setVisiblePosts] = useState(10); // Initial amount of posts to show
  const [loadingPosts, setLoadingPosts] = useState(false); // Track posts loading state


  // Function to load more posts when scrolled to the bottom, with a 1.5-second delay
  function loadMorePosts () {
    setLoadingPosts(true); // Start loading

    // Delay the loading of the next set of posts by 1.5 seconds
    setTimeout(() => {
      setVisiblePosts(visiblePosts + 7); // Increase the visible post count by 10
      setLoadingPosts(false); // End loading
    }, 1000);
  };









  if (loading) {
    return (
      <div className='circularProgressContainer'>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size="5rem" />
        </Box>
      </div>
    )
  }

  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }




  return (
    <Box className="post-feed-container">
      <List className="post-feed">

      <InfiniteScroll
        dataLength={visiblePosts} // This is the length of the currently visible posts
        next={loadMorePosts} // Function to call when more posts are to be loaded
        hasMore={visiblePosts < filteredMessages.length} // Check if there's more to load
        loader={ // Display while loading more
          loadingPosts && 
          <CircularProgress size="5rem" sx={{"marginBottom":"5rem"}}/>
        } 
      >

        {/* only display if filteredMessages is populated. */}
        {filteredMessages && filteredMessages.length > 0 ? 
        //displaying 10 at a time
        (filteredMessages.slice(0, visiblePosts).map(post => (

      <ListItem key={post._id} className={darkModeOn?"post-item-dark":"post-item"} alignItems="flex-start">
        <PostDisplay
          post={post}
        />
      </ListItem>
          
        ))
        ) : (
          <p>No posts available.</p>
        )}


      </InfiniteScroll>
      </List>
    </Box>
  
  );
};


export default AllPostsDisplay;

