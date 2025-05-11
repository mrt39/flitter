/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { Box, Alert, CircularProgress, List, ListItem } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import VirtualizedContent from './VirtualizedContent.jsx';
import PostDisplay from './PostDisplay.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { usePost } from '../contexts/PostContext.jsx';
import { getAllPosts } from '../utilities/postService.js';
import { useInfiniteScroll } from '../utilities/infiniteScrollUtils.js';
import '../styles/AllPostsDisplay.css';

function AllPostsDisplay({fromThisUser}) {
  const { darkModeOn, appContainerRef } = useUI();
  const { currentUser, profileUpdated } = useAuth();
  const { selectedUser} = useUser();
  const { 
    allPosts, 
    setAllPosts, 
    refreshPosts, 
    imageSubmitted,
    imgSubmittedNavbar, 
    imgSubmittedHomePage, 
    pressedSubmitPost, 
    activeTab, 
    searchWord 
  } = usePost();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredMessages, setFilteredMessages] = useState([]);

  //control shuffling
  //create this variable to prevent the homepage AllPostsDisplay from shuffling posts when the user likes or comments on a post
  const [shouldNotShuffle, setShouldNotShuffle] = useState(false); 
  const [shuffledOrder, setShuffledOrder] = useState([]);
  const [newPostAdded, setNewPostAdded] = useState(false);

  //create a ref to store the previous values of the dependencies
  const prevDeps = useRef([pressedSubmitPost, imgSubmittedNavbar, imgSubmittedHomePage, refreshPosts]);
  
  //use infinite scroll utility
  const { visibleItems: visiblePosts, loading: loadingPosts, loadMoreItems: loadMorePosts } = 
    useInfiniteScroll(15, 10, 1000);

  //fetch for getting data of all posts
  useEffect(() => {
    const getMessages = () => {
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
    };
  
    //check if the useEffect has been triggered by any of the pressedSubmitPost, imgSubmittedNavbar, imgSubmittedHomePage dependencies
    if (
      prevDeps.current[0] !== pressedSubmitPost ||
      prevDeps.current[1] !== imageSubmitted 
    ) {
      setNewPostAdded(true);
      setShouldNotShuffle(true);
    }
  
    //if the useEffect has been triggered by the refreshPosts dependency (like or comment), set the shouldNotShuffle state to true
    if (prevDeps.current[2] !== refreshPosts) {
      setShouldNotShuffle(true);
    }
  
    prevDeps.current = [pressedSubmitPost, imageSubmitted, refreshPosts];
  
    //if there is a searchWord (from WhatsHappening.jsx), do not fetch all posts (which will disrupt the search filter), set loading to false
    if (!searchWord&& currentUser) {
      getMessages();
    } else {
      setLoading(false);
    }
  }, [pressedSubmitPost, imageSubmitted, refreshPosts, profileUpdated]);
  
  //useEffect for sorting messages (shuffle or sort by date)
  useEffect(() => {
    sortMessageDisplay();
  }, [allPosts, selectedUser, searchWord]);

  async function sortMessageDisplay() {
    let filteredMessagesinFunc = [];
  
    //if the logged in user is displaying another user's profile, always prioritize displaying that user's posts
    //do not add the newly added post to the top, since it's another user's profile, consisting only of that user's posts
    if (fromThisUser) {
      //if viewing a profile page, always filter for that user's posts
      allPosts.forEach((post) => {
        if (post.from && post.from && post.from.shortId === fromThisUser.shortId) {
          filteredMessagesinFunc.push(post);
        }
      });
  
      //sort filteredMessages array by their dates, descending order
      filteredMessagesinFunc.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      //reset newPostAdded if it was set
      if (newPostAdded) {
        setNewPostAdded(false);
      }
    }
    //only handle new post ordering for home page
    else if (newPostAdded) {
      //add the new post's index (which is 0) to the top of the shuffledOrder array, and increment the index of all the other posts by 1 
      //so that the new post is at the top and the other posts are in the same order
      const order = [0, ...shuffledOrder.map(index => index + 1)];
      setShuffledOrder(order);
  
      //get the new posts from the allposts array in the new order
      filteredMessagesinFunc = order.map(index => allPosts[index]);
  
      setNewPostAdded(false);
    }
    else { // If fromThisUser does not exist (rendering home route), get all the messages, shuffle them
      //if the user has liked or commented on a post, do not shuffle the posts (which sets the shouldNotShuffle state to true), 
      //use the previously shuffled order
      if (shouldNotShuffle && shuffledOrder.length > 0) {
        //get the posts from the allposts array in the saved shuffled order
        filteredMessagesinFunc = shuffledOrder.map(index => allPosts[index]);
        //reset the shouldNotShuffle state
        setShouldNotShuffle(false);
      } else {
        //otherwise, shuffle the posts
        const order = Array.from({ length: allPosts.length }, (_, i) => i);
        //shuffle the indices array using Fisher-Yates shuffle algorithm
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        setShuffledOrder(order);
        //get the posts from the allposts array in the shuffled order
        filteredMessagesinFunc = order.map(index => allPosts[index]);
      }
    }
  
    setFilteredMessages(filteredMessagesinFunc);
  }

  //filter based on searchWord
  useEffect(() => {
    if (searchWord) {
      const searchWordLower = searchWord.toLowerCase();
      const filtered = allPosts.filter(post => post.message && post.message.toLowerCase().includes(searchWordLower));
      //shuffle the filtered messages
      for (let i = filtered.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }
      //set shuffledOrder to the order of the filtered messages
      const order = filtered.map(post => allPosts.indexOf(post));

      setShuffledOrder(order);
      setFilteredMessages(filtered);
    } else {
      //reset to all posts if searchWord is cleared
      return;
    }
  }, [searchWord]);

  if (loading) {
    return (
      <div className='circularProgressContainer'>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size="5rem" />
        </Box>
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  //filter messages based on activeTab before rendering (if activeTab is 'following', only display messages from users the currentUser is following)
  const messagesToDisplay = activeTab === 'following'
  ? filteredMessages.filter(post => post && post.from /* ensure post and post.from is defined before rendering. important after image uploading */ 
    && 
    currentUser.followingtheseID.includes(post.from._id))
  : filteredMessages;

  //placeholder component for comments that are not in viewport, for content virtualization strategy
  function PostPlaceholder() {
  //a minimal representation of a comment to maintain layout
    return (
      <div className={`post-placeholder ${darkModeOn ? 'dark-mode' : ''}`}>
        <div className="avatar-placeholder"></div>
        <div className="content-placeholder">
          <div className="header-placeholder"></div>
          <div className="text-placeholder"></div>
        </div>
      </div>
    );
  }

  return (
    <Box className="post-feed-container" id="post-feed-container">
      <List className="post-feed" id="post-feed">
        <InfiniteScroll
          dataLength={visiblePosts} // length of the currently visible posts
          next={loadMorePosts} // function to call to be load more posts
          threshold={1.0}
          scrollThreshold="95%" //only trigger when user is very close to bottom (95% scrolled)
          hasMore={visiblePosts < messagesToDisplay.length} // check if there's more to load
          scrollableTarget={appContainerRef.current} // set the scrollable target as the appContainerRef (passed from Home.jsx)
          loader={ // display while loading more
            loadingPosts && 
            <CircularProgress size="5rem" sx={{"marginBottom":"5rem"}}/>
          } 
        >
          {/* only display if messagesToDisplay is populated. */}
          {messagesToDisplay && messagesToDisplay.length > 0 ? 
          //displaying posts 10 at a time
          (messagesToDisplay.slice(0, visiblePosts).map(post => 
            post && ( // ensure post is defined before rendering ListItem and PostDisplay. important when image uploading takes time
              <ListItem key={post._id} className={`post-item ${darkModeOn ? 'dark-mode' : ''}`} alignItems="flex-start">
                {/* wrap the post in virtualized content component, for virtualized content strategy */}
              <VirtualizedContent
                placeholder={<PostPlaceholder />}
                initiallyVisible={
                  //first post is always visible
                  post === messagesToDisplay[0] || 
                  //newly loaded posts through infinitescroll are initially visible (only the last batch) so content virtualization won't be applied to them(placeholder won't be displayed)
                  //automatically identifies newly loaded posts (any post with index ≥ current visible count - batch size)
                  //as user scrolls and visiblePosts increases (15→25→35), this window moves down exactly one batch at a time, ensuring only new batches render immediately
                  messagesToDisplay.indexOf(post) >= visiblePosts - 10
                }
                className="virtualized-post-wrapper"
              >
                <PostDisplay post={post} />
              </VirtualizedContent>
              </ListItem>
            )
          )
          ) : (
            <div className={`no-posts-available-text-container ${darkModeOn ? 'dark-mode' : ''}`}>
              <p>No posts available.</p>
              {activeTab === 'following' && <p>Follow people to see their posts here!</p>}
            </div>
          )}
        </InfiniteScroll>
      </List>
    </Box>
  );
};

export default AllPostsDisplay;