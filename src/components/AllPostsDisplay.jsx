/* eslint-disable react/prop-types */
import { useContext, useState, useEffect, useRef } from "react";
import PostDisplay from './PostDisplay.jsx';
import { AppStatesContext, UserContext } from '../App.jsx';
import Box from '@mui/material/Box';
import { CircularProgress, Alert} from '@mui/material';
import {List, ListItem} from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component'; //infinite scroll 
import '../styles/AllPostsDisplay.css'

const AllPostsDisplay = ({fromThisUser}) => {

  const { allPosts, setAllPosts, profileUpdated, imgSubmittedNavbar, imgSubmittedHomePage, 
    pressedSubmitPost, refreshPosts, darkModeOn, appContainerRef, searchWord, activeTab} = useContext(AppStatesContext); 

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const {currentUser, selectedUser} = useContext(UserContext); 

  const [filteredMessages, setFilteredMessages] = useState([])

  // Control shuffling. 
  //Create this variable to prevent the homepage AllPostsDisplay from shuffling posts when the user likes or comments on a post.
  const [shouldNotShuffle, setShouldNotShuffle] = useState(false); 
  const [shuffledOrder, setShuffledOrder] = useState([]);
  const [newPostAdded, setNewPostAdded] = useState(false);

  
  // Create a ref to store the previous values of the dependencies
  const prevDeps = useRef([pressedSubmitPost, imgSubmittedNavbar, imgSubmittedHomePage, refreshPosts]);

  // fetch for getting data of all posts
  useEffect(() => {
    const getMessages = () => {
      fetch(import.meta.env.VITE_BACKEND_URL + '/getallposts', {
        method: 'GET',
      })
        .then(response => {
          if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          // sort data by dates, descending order
          data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setAllPosts(data);

          setLoading(false);
        })
        .catch(error => {
          setError(error.message);
          console.error('Error:', error);
          setLoading(false);
        });
    };
  
    // Check if the useEffect has been triggered by any of the pressedSubmitPost, imgSubmittedNavbar, imgSubmittedHomePage dependencies
    if (
      prevDeps.current[0] !== pressedSubmitPost ||
      prevDeps.current[1] !== imgSubmittedNavbar ||
      prevDeps.current[2] !== imgSubmittedHomePage
    ) {
      setNewPostAdded(true);
      setShouldNotShuffle(true);
    }
  
    // If the useEffect has been triggered by the refreshPosts dependency (like or comment), set the shouldNotShuffle state to true
    if (prevDeps.current[3] !== refreshPosts) {
      setShouldNotShuffle(true);
    }
  
    prevDeps.current = [pressedSubmitPost, imgSubmittedNavbar, imgSubmittedHomePage, refreshPosts];
  
    //if there is a searchWord (from WhatsHappening.jsx), do not fetch all posts (which will disrupt the search filter), set loading to false
    if (!searchWord) {
      getMessages();
    } else {
      setLoading(false);
    }
  }, [pressedSubmitPost, imgSubmittedNavbar, imgSubmittedHomePage, refreshPosts, profileUpdated]);
  
  // useEffect for sorting messages (shuffle or sort by date)
  useEffect(() => {
    sortMessageDisplay();
  }, [allPosts, selectedUser, searchWord]);

    
  

  async function sortMessageDisplay() {
    let filteredMessagesinFunc = [];
  
  //if a new post has been added, place it at the top and retain the order of the other posts
  if (newPostAdded) {

      //add the new post's index (which is 0) to the top of the shuffledOrder array, and increment the index of all the other posts by 1 
      //so that the new post is at the top and the other posts are in the same order
      const order = [0, ...shuffledOrder.map(index => index + 1)];
      setShuffledOrder(order);

      //get the new posts from the allposts array in the new order
      filteredMessagesinFunc = order.map(index => allPosts[index]);

      setFilteredMessages(filteredMessagesinFunc);

      setNewPostAdded(false);
    return;
    }
      //if fromThisUser exists (rendering /profile route), only get the messages from that user, display chronologically
      if (fromThisUser) {
        allPosts.forEach((post) => {
          // Check if the post is from this user
          if (post.from[0]._id === fromThisUser._id) {
            // Push the post into filteredMessages array
            filteredMessagesinFunc.push(post);
          }
        });
  
        //sort filteredMessages array by their dates, descending order
        filteredMessagesinFunc.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else { // If fromThisUser does not exist (rendering home route), get all the messages, shuffle them
        //if the user has liked or commented on a post, do not shuffle the posts (which sets the shouldNotShuffle state to true), use the previously shuffled order
        if (shouldNotShuffle && shuffledOrder.length > 0) {
          //get the new posts from the allposts array in the stored (under shuffledOrder) order
          filteredMessagesinFunc = shuffledOrder.map(index => allPosts[index]);
          setShouldNotShuffle(false);
        } else {
            filteredMessagesinFunc = [...allPosts];
            // Shuffle the posts
            const order = filteredMessagesinFunc.map((_, index) => index);
            for (let i = filteredMessagesinFunc.length - 1; i >= 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              //store the order of the posts in the shuffle
              [order[i], order[j]] = [order[j], order[i]];
            }
            setShuffledOrder(order);
            //get the posts from the allposts in the shuffled order
            filteredMessagesinFunc = order.map(index => allPosts[index]);
            setShouldNotShuffle(false);
        }
      }
    
  
    setFilteredMessages(filteredMessagesinFunc);
  }

  
  /* ---------------------------INFINITE SCROLL FUNCTIONALITY--------------------------- */
  //state for setting the visible post count, for infinite scroll functionality 
  const [visiblePosts, setVisiblePosts] = useState(15); // initial amount of posts to show
  const [loadingPosts, setLoadingPosts] = useState(false); // track posts loading state

  // function to load more posts when scrolled to the bottom, with a 1.5-second delay
  function loadMorePosts () {
    setLoadingPosts(true); // Start loading

    // delay the loading of the next set of posts by 1.5 seconds
    setTimeout(() => {
      setVisiblePosts(visiblePosts + 10); // increase the visible post count by 10
      setLoadingPosts(false); // end loading
    }, 1000);
  };

  //filter based on searchWord
  useEffect(() => {
    if (searchWord) {
      const searchWordLower = searchWord.toLowerCase();
      const filtered = allPosts.filter(post => post.message&&post.message.toLowerCase().includes(searchWordLower));
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
      // Reset to all posts if searchWord is cleared
      return
    }
  }, [searchWord]);




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



  //filter messages based on activeTab before rendering (if activeTab is 'following', only display messages from users the currentUser is following)
    const messagesToDisplay = activeTab === 'following'
    ? filteredMessages.filter(post => post && post.from && /* ensure post and post.from is defined before rendering. important after image uploading */ currentUser.followingtheseID.includes(post.from[0]._id))
    : filteredMessages;

  return (
    <Box className="post-feed-container" id="post-feed-container">
      <List className="post-feed" id="post-feed">

      <InfiniteScroll
        dataLength={visiblePosts} // length of the currently visible posts
        next={loadMorePosts} // function to call to be load more posts
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
          post &&( // ensure post is defined before rendering ListItem and PostDisplay. important when image uploading takes time
        <ListItem key={post._id} className={`post-item ${darkModeOn ? 'dark-mode' : ''}`} alignItems="flex-start">
          <PostDisplay
            post={post}
          />
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



