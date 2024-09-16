/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import CommentForm from "../components/CommentForm.jsx";
import CommentsDisplay from "../components/CommentsDisplay.jsx";
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
import '../styles/PostsDisplay.css'



const PostsDisplay = ({fromThisUser}) => {

  //Pass the UserContext defined in app.jsx
  const { currentUser, setSelectedUser } = useContext(UserContext); 

  const { allPosts, setAllPosts, imgSubmittedNavbar, imgSubmittedHomePage, pressedSubmitPost} = useContext(AppStatesContext); 

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  //handle liking the posts
  const [likepostID, setLikePostID] = useState("")
  const [pressedLikePost, setPressedLikePost] = useState(false)

  const [filteredMessages, setFilteredMessages] = useState([])

  
  //handle commenting on the posts
  const [clickedPostComment, setClickedPostComment] = useState(false);


  const navigate = useNavigate(); 

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
          console.log(data)
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
    }, [pressedSubmitPost, imgSubmittedNavbar, imgSubmittedHomePage, pressedLikePost, clickedPostComment]); 


      
      
  function handleLike(postID){
    setLikePostID(postID)
    setPressedLikePost(true)
  }

   //useffect for liking posts
   useEffect(() => {
    async function likePost() {
      await fetch(import.meta.env.VITE_BACKEND_URL+'/likePost', {
        method: "PATCH",
        // storing date as isostring to make the reading easier later
        body: JSON.stringify({ postID: likepostID, likedBy: currentUser}), 
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
        credentials:"include" //required for sending the cookie data-authorization check
    })
      .then(async result => {
        if (result.ok){
          await result.json();
          console.log("Liked Post!")
          setPressedLikePost(false)
        } else{
          throw new Error(result)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setPressedLikePost(false)
      }); 
    }
    //only trigger when comment is posted
    if (pressedLikePost ===true){
      likePost();
    } 
  }, [pressedLikePost]);


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
        filteredMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
      }else{ //if fromThisUser does not exist (rendering home route),  get all the messages, display randomly
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

        {/* only display if allPosts is populated. */}
        {allPosts && allPosts.length > 0 ? 
        //displaying 10 at a time
        (filteredMessages.slice(0, visiblePosts).map(post => (
        
  /*       <li key={post._id}>
            <Link onClick={() => handleProfileRouting(post.from[0])}>
              <h3>{post.from[0].name}</h3>
              <Avatar
              alt={post.from[0].name}
              src={post.from[0].picture? post.from[0].picture : post.from[0].uploadedpic}
              sx={{ width: 80, height: 80, margin: 'auto', mt: 2 }}
              />
            </Link>

            {post.message && (
              <p>{post.message}</p>
            )}

            {post.image && (
              <p>
                <img className="msgBoxImg1" src={post.image} alt="image" />
              </p>
            )}

            <p>{dayjs(new Date(post.date)).format('MMM D, H:mm')}</p>
            <button onClick={() => handleLike(post._id)}>Like Post</button>
            <p>Likes: {post.likeCount}</p>

            <CommentForm postID={post._id} 
              clickedPostComment={clickedPostComment} 
              setClickedPostComment={setClickedPostComment} 
            />
            <p>Comments: {post.commentCount}</p>

            <br />

            <CommentsDisplay post={post} />

            <br /> <br /> <br />
          </li> */


/*           <ListItem key={post._id} className="feed-tweet">
          <Avatar 
            alt={post.from[0].name}
            src={post.from[0].picture? post.from[0].picture : post.from[0].uploadedpic}
            sx={{ width: 80, height: 80, margin: 'auto', mt: 2 }}
          />
          <ListItemText
            primary={post.from[0].name}
            secondary={post.message}
            className="tweet-content"
          />
        </ListItem> */

/*         <div key={post._id}>
        <Card className="tweet-card">
          <CardContent className="tweet-content">
          <Avatar 
            alt={post.from[0].name}
            src={post.from[0].picture? post.from[0].picture : post.from[0].uploadedpic}
            sx={{ width: 80, height: 80, margin: 'auto', mt: 2 }}
          />
            <Box className="tweet-body">
              <Typography className="tweet-user">
                {post.from[0].name} 
              </Typography>
              <Typography className="tweet-text">
                {post.message}
              </Typography>
              <Typography className="tweet-date">
                {dayjs(new Date(post.date)).format('MMM D, H:mm')}
              </Typography>
              <Box className="tweet-actions">
                <IconButton size="small" className="icon-button">
                  <ChatBubbleOutline fontSize="small" />
                </IconButton>
                <IconButton size="small" className="icon-button">
                  <FavoriteBorder fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Divider className="tweet-divider" /> 
        </div> */




      <ListItem key={post._id} className="post-item" alignItems="flex-start">
      <ListItemAvatar>
      <Avatar 
            alt={post.from[0].name}
            src={post.from[0].picture? post.from[0].picture : post.from[0].uploadedpic}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <div className="post-header">
            <Typography variant="subtitle1" className="post-name">
              {post.from[0].name}
            </Typography>
            <Typography variant="body2" color="textSecondary" className="post-date">
              {dayjs(new Date(post.date)).format('MMM D, H:mm')}
            </Typography>
          </div>
        }
        secondary={
          <>
            <Typography variant="body1" className="post-content">
              {post.message}
            </Typography>
            <div className="post-actions">
              <IconButton size="small" className="icon-button comment-button">
                <ChatBubbleOutline fontSize="small" />
                <Typography variant="body1" className="postLikeCommentCount">
                  {post.commentCount}
                </Typography>
              </IconButton>
              <IconButton size="small" className="icon-button like-button">
                <FavoriteBorder fontSize="small" />
                <Typography variant="body1" className="postLikeCommentCount">
                  {post.likeCount}
                </Typography>
              </IconButton>
            </div>
          </>
        }
      />
      </ListItem>
          
        ))
        ) : (
          <p>No posts available</p>
        )}


      </InfiniteScroll>
      </List>
    </Box>
  
  );
};


export default PostsDisplay;

