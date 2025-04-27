/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import CommentDisplay from './CommentDisplay.jsx';
import {ListItem,} from '@mui/material';
import Box from '@mui/material/Box';
import { CircularProgress, List} from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component'; //infinite scroll 
import { useInfiniteScroll } from '../utilities/infiniteScrollUtils.js';
import { useUI } from '../contexts/UIContext.jsx';
import '../styles/AllCommentsDisplay.css'


const AllCommentsDisplay = ({post}) => {
  const [sortedComments, setSortedComments] = useState([]);
  const { darkModeOn, appContainerRef } = useUI();

  useEffect(() => {
    //sort comments by dates, descending order
    post.comments.sort((comment1,comment2) => (comment1.date < comment2.date) ? 1 : ((comment2.date < comment1.date) ? -1 : 0))
    setSortedComments(post.comments)
  }, [post])

  //use infinite scroll utility
  const { visibleItems: visibleComments, loading: loadingComments, loadMoreItems: loadMoreComments } =
    useInfiniteScroll(20, 7, 1000);

  return (
  <Box className="comment-feed-container">
    <List className="comment-feed">
      <InfiniteScroll
        dataLength={visibleComments} //length of the currently visible comments
        next={loadMoreComments} //function to call when more comments are to be loaded
        hasMore={visibleComments < sortedComments.length} //check if there's more to load
        scrollableTarget={appContainerRef.current} //set the scrollable target as the appContainerRef (passed from Home.jsx)
        loader={ //display while loading more
          loadingComments && 
          <CircularProgress size="5rem" sx={{"marginBottom":"5rem"}}/>
        } 
      >
        {sortedComments.length > 0 ? 
        //displaying comments 10 at a time
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