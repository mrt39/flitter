/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostContent from './PostContent.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';
import { usePost } from '../contexts/PostContext.jsx';
import { likePost } from '../utilities/postService.js';
import { handleOptimisticLike, revertOptimisticLike } from '../utilities/optimisticUpdateUtils.js';


function PostDisplay({post, location}) {
  const { currentUser } = useAuth();
  const { darkModeOn } = useUI();
  const { handleProfileRouting } = useUser();
  const { refreshPosts, setRefreshPosts } = usePost();

  //state for storing if the currentuser has already liked this post
  const [currentUserLikedPost, setCurrentUserLikedPost] = useState(false);
  //Id for liking the posts
  const [pressedLikePost, setPressedLikePost] = useState(false);
  //state to track if like button is disabled during API call
  const [likeButtonDisabled, setLikeButtonDisabled] = useState(false);

  //state to track the current like count for optimistic updates
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(post.likeCount);

  //state to store the previous like state in case api call fails and optimistic update needs to revert
  const [previousLikeState, setPreviousLikeState] = useState(false);

  //temporary state for like animation
  //remove "liked" class after 0.3 seconds to prevent animation from playing when user likes another post
  const [tempLiked, setTempLiked] = useState(false);

  //handle routing to post (singular post page) when the post is clicked
  const navigate = useNavigate();

  //check initial like state when component mounts
  useEffect(() => {
    //find if post is already liked by the current user, (if user is already in likedby array)
    //find via converting id objects to string because querying with id's doesn't work
    const likedPostIndex = post.likedby.findIndex(u => u._id.toString() === currentUser._id.toString());
    //update state based on whether the user has liked this post or not
    setCurrentUserLikedPost(likedPostIndex !== -1);
    setOptimisticLikeCount(post.likeCount);
  }, [post, currentUser]);
  
  function handlePostRouting(link) {
    navigate(link);
  }
    
  function handleLike() {
    //prevent multiple clicks while processing
    if (likeButtonDisabled) return;
    
    //use optimistic update utility function
    handleOptimisticLike(
      post, 
      currentUser, 
      setOptimisticLikeCount, 
      setCurrentUserLikedPost, 
      setPreviousLikeState
    );
    
    //animation effect
    setTempLiked(true);
    setTimeout(() => setTempLiked(false), 300);
    
    //disable like button temporarily to prevent double-clicking
    setLikeButtonDisabled(true);
    
    //trigger the API call to update the server
    setPressedLikePost(prev => !prev);
  }

  //useffect for liking posts
  useEffect(() => {
    async function likeThisPost() {
      try {
        await likePost(currentUser, post._id);
        console.log("Post liked/unliked successfully!");
        setRefreshPosts(prev => !prev);
      } catch (error) {
        console.error('Error:', error);
        //use utility function to revert optimistic updates if the API call fails
        revertOptimisticLike(
          post, 
          previousLikeState, 
          setCurrentUserLikedPost, 
          setOptimisticLikeCount
        );
      } finally {
        setLikeButtonDisabled(false);
      }
    }
    
    if (likeButtonDisabled) {
      likeThisPost();
    }
  }, [pressedLikePost]);

  return (
    <span className="postDisplayContainer">
      {location === "singular-post-page" ? 
      (
        <PostContent 
          post={post}
          location={location}
          currentUserLikedPost={currentUserLikedPost}
          optimisticLikeCount={optimisticLikeCount}
          tempLiked={tempLiked}
          likeButtonDisabled={likeButtonDisabled}
          handleLike={handleLike}
          handleProfileRouting={handleProfileRouting}
        />
      ) : (
        <span 
          className={`singularPostLinkOnPost ${darkModeOn ? 'dark-mode' : ''}`} 
          onClick={() => handlePostRouting(`/post/${post._id}`)}
        >
          <PostContent 
            post={post}
            location={location}
            currentUserLikedPost={currentUserLikedPost}
            optimisticLikeCount={optimisticLikeCount}
            tempLiked={tempLiked}
            likeButtonDisabled={likeButtonDisabled}
            handleLike={handleLike}
            handleProfileRouting={handleProfileRouting}
          />
        </span>
      )}
    </span>
  );
}

export default PostDisplay;