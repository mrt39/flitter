/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppStatesContext } from '../App.jsx';
import PostDisplay from '../components/PostDisplay.jsx';
import CommentForm from '../components/CommentForm.jsx';
import AllCommentsDisplay from '../components/AllCommentsDisplay.jsx';


import Box from '@mui/material/Box';
import { CircularProgress, Alert, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/SingularPostPage.css'




const SingularPostPage = ({}) => {


  const { refreshPosts} = useContext(AppStatesContext); 

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
    const getSingularPost = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/getsingularpost/'+last24Chars, {
      method: 'GET',
      })
      .then(response => {
          if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
      })
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
    getSingularPost();

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
   <AppBar position="static" elevation={0} color="default">
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

