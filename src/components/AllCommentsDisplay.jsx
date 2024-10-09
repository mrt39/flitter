/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import {AppStatesContext } from '../App.jsx';
import CommentDisplay from './CommentDisplay.jsx';
import {ListItem,} from '@mui/material';
import Box from '@mui/material/Box';
import { CircularProgress, Alert, Avatar } from '@mui/material';
import { TextField, Button, List, ListItemText, Paper, ListItemAvatar} from '@mui/material';


//infinite scroll 
import InfiniteScroll from 'react-infinite-scroll-component';
import '../styles/AllCommentsDisplay.css'


const AllCommentsDisplay = ({post}) => {


  const [sortedComments, setSortedComments] = useState([])

  const {darkModeOn, appContainerRef} = useContext(AppStatesContext); 



  useEffect(() => {
    //sort comments by dates, descending order
    post.comments.sort((comment1,comment2) => (comment1.date < comment2.date) ? 1 : ((comment2.date < comment1.date) ? -1 : 0))
    setSortedComments(post.comments)
  }, [post])



  /* ---------------------------INFINITE SCROLL FUNCTIONALITY--------------------------- */
  //state for setting the visible post count, for infinite scroll functionality 
  const [visibleComments, setVisibleComments] = useState(20); // Initial amount of comments to show
  const [loadingComments, setLoadingComments] = useState(false); // Track comments loading state


  // Function to load more comments when scrolled to the bottom, with a 1.5-second delay
  function loadMoreComments () {
    setLoadingComments(true); // Start loading

    // Delay the loading of the next set of comments by 1.5 seconds
    setTimeout(() => {
      setVisibleComments(visibleComments + 7); // Increase the visible post count by 10
      setLoadingComments(false); // End loading
    }, 1000);
  };






  return (
  <Box className="comment-feed-container">
    <List className="comment-feed">
      <InfiniteScroll
        dataLength={visibleComments} // this is the length of the currently visible comments
        next={loadMoreComments} // function to call when more comments are to be loaded
        hasMore={visibleComments < sortedComments.length} // check if there's more to load
        scrollableTarget={appContainerRef.current} // set the scrollable target as the appContainerRef (passed from Home.jsx)
        loader={ // display while loading more
          loadingComments && 
          <CircularProgress size="5rem" sx={{"marginBottom":"5rem"}}/>
        } 
      >
        {sortedComments.length > 0 ? 
        //displaying 10 at a time
        (sortedComments.slice(0, visibleComments).map(comment => (
          <ListItem 
          key={comment._id} 
          className={`comment-item ${darkModeOn ? 'dark-mode' : ''}`} 
          alignItems="flex-start"
          >
            <CommentDisplay
            key={comment._id}
            comment={comment}
            />

          </ListItem>

          
        ))
        ) : (
        ""
        )}


      </InfiniteScroll>
    </List>
  </Box>
  );
};

export default AllCommentsDisplay;