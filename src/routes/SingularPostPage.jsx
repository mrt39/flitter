/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostDisplay from '../components/PostDisplay.jsx';
import CommentForm from '../components/CommentForm.jsx';
import AllCommentsDisplay from '../components/AllCommentsDisplay.jsx';
import { CircularProgress, Box, Alert, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useUI } from '../contexts/UIContext.jsx';
import { usePost } from '../contexts/PostContext.jsx';
import { getSinglePost } from '../utilities/postService.js';
import '../styles/SingularPostPage.css'

const SingularPostPage = ({}) => {
  //use context hooks
  const { refreshPosts } = usePost();
  const { darkModeOn } = useUI();

  const [singularPost, setSingularPost] = useState(null)
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  //get the last 24 characters of current url (which is the id of the post)
  const location = useLocation();
  // Get the pathname from the location object
  const currentPath = location.pathname;
  // Extract the last 24 characters
  const last24Chars = currentPath.slice(-24);

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/'); // Navigate back to home page
  };

  useEffect(() => {
    const getSingularPostFromApi = () => {
      getSinglePost(last24Chars)
        .then(data => {
          setSingularPost(data)
          setLoading(false)
        })
        .catch(error => {
          setError(error.message);
          console.error('Error:', error);
          setLoading(false)
        });
    };
    getSingularPostFromApi();
  }, [refreshPosts]); 

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
   <>
   <div className="singularPostPage">
   <AppBar className={`singularPostPage-appbar ${darkModeOn ? 'dark-mode' : ''}`} position="static" elevation={0} color="default">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="back"
          onClick={handleBackClick}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Post
        </Typography>
      </Toolbar>
    </AppBar>
    <div className="singularPostContainer">
        <PostDisplay
          post={singularPost}
          location={"singular-post-page"}
        />
    </div>
    <CommentForm
      post={singularPost}
    />
    <AllCommentsDisplay
      post={singularPost}
    />
   </div>
   </>
  );
};

export default SingularPostPage;