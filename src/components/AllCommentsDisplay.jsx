/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import CommentDisplay from './CommentDisplay.jsx';
import {ListItem,} from '@mui/material';
import Box from '@mui/material/Box';
import { CircularProgress, List} from '@mui/material';
import VirtualizedContent from './VirtualizedContent.jsx';
import InfiniteScroll from 'react-infinite-scroll-component'; 
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

  //placeholder component for comments that are not in viewport, for content virtualization strategy
  function CommentPlaceholder() {
    //a minimal representation of a comment to maintain layout
    return (
      <div className={`comment-placeholder ${darkModeOn ? 'dark-mode' : ''}`}>
        <div className="avatar-placeholder"></div>
        <div className="comment-content-placeholder">
          <div className="comment-header-placeholder"></div>
          <div className="comment-text-placeholder"></div>
        </div>
      </div>
    );
  }

  return (
  <Box className="comment-feed-container">
    <List className="comment-feed">
      <InfiniteScroll
        dataLength={visibleComments} //length of the currently visible comments
        next={loadMoreComments} //function to call when more comments are to be loaded
        threshold={1.0}
        scrollThreshold="95%" //only trigger when user is very close to bottom (95% scrolled)
        hasMore={visibleComments < sortedComments.length} //check if there's more to load
        scrollableTarget={appContainerRef.current} //set the scrollable target as the appContainerRef (passed from Home.jsx)
        onScroll={() => console.log("Scroll event detected in AllCommentsDisplay InfiniteScroll")}
        loader={ //display while loading more
          loadingComments && 
          <CircularProgress size="5rem" sx={{"marginBottom":"5rem"}}/>
        } 
      >
        {sortedComments.length > 0 ? 
        //displaying comments 10 at a time, with content virtualization strategy
          (sortedComments.slice(0, visibleComments).map(comment => (
            <ListItem 
              key={comment._id} 
              className={`comment-item ${darkModeOn ? 'dark-mode' : ''}`} 
              alignItems="flex-start"
            >
              {/* wrap the comment in virtualized content component */}
              <VirtualizedContent
                placeholder={<CommentPlaceholder />}
                initiallyVisible={
                  //first comment is always visible
                  comment === sortedComments[0] || 
                  //newly loaded comments through infinitescroll are initially visible (only the last batch) so content virtualization won't be applied to them(placeholder won't be displayed)
                  //automatically identifies newly loaded comments (any comment with index ≥ current visible count - batch size)
                  //as user scrolls and visibleComments increases (20→27→34), this window moves down exactly one batch at a time, ensuring only new batches render immediately
                  sortedComments.indexOf(comment) >= visibleComments - 7
                }
                className="virtualized-comment-wrapper"
              >
                <CommentDisplay
                  key={comment._id}
                  comment={comment}
                />
              </VirtualizedContent>
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