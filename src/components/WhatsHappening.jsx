/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, CircularProgress, Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useUI } from '../contexts/UIContext.jsx';
import { usePost } from '../contexts/PostContext.jsx';
import { getAllPosts } from '../utilities/postService.js';

import '../styles/WhatsHappening.css';

const WhatsHappening = () => {
  //use context hooks
  const { darkModeOn } = useUI();
  const { 
    allPosts, 
    setAllPosts, 
    mostIteratedWords, 
    setActiveTab, 
    setSearchWord 
  } = usePost();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  //if allPosts array isn't populated (user has not been to the homepage to get the fetch in AllPostsDisplay), fetch all posts
  useEffect(() => {
    //only attempt to fetch posts if allPosts array is empty (isn't populated)
    if (allPosts.length === 0) {
      getAllPosts()
        .then(data => {
          setAllPosts(data);
          setLoading(false);
        })
        .catch(error => {
          setError(error.message);
          console.error('Error:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);
    
  //set the search word to the word clicked on
  async function sortSearchWord(word) {
    //set the active tab to "forYou" when a word is clicked on, so that it displays the posts from everyone that contains the word
    await setActiveTab('forYou')
    await setSearchWord(word);
  }

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
    <Card className="sidebarRight-section-card">
      <CardContent className="sidebarRight-section-cardContent">
        <Typography variant="h6" component="div" className='sidebarRightTitle'>
          What&apos;s happening
        </Typography>
        <List>
          {mostIteratedWords && mostIteratedWords.map((word, index) => (
            <ListItem className="whatsHappening-listitem" key={index}>
              <span className={`whatsHappening-listitem-span ${darkModeOn && 'dark-mode'}`} onClick={() => { sortSearchWord(word.word); navigate('/');}}>
                <ListItemText
                  primary={
                    <>
                      <Typography
                        variant="body2"
                        style={{
                          fontSize: '13px',
                          fontWeight: 400,
                          color: darkModeOn ? 'rgb(113, 118, 123)' : 'rgb(83, 100, 113)',
                        }}
                      >
                        Trending
                      </Typography>
                      <Typography
                        variant="h6"
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                        }}
                      >
                        {word.word}
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{
                          fontSize: '13px',
                          fontWeight: 400,
                          color: darkModeOn ? 'rgb(113, 118, 123)' : 'rgb(83, 100, 113)',
                        }}
                      >
                        {`${word.timesIterated} posts`}
                      </Typography>
                    </>
                  }
                />
              </span>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default WhatsHappening;