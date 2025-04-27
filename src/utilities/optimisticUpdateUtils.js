//utility functions for optimistic updates to improve UI responsiveness

//handle optimistic like update
function handleOptimisticLike(post, currentUser, setOptimisticLikeCount, setCurrentUserLikedPost, setPreviousLikeState) {
    const postId = post._id;
    const userId = currentUser._id;
    
    //find if post is already liked by the current user, (if user is already in likedby array)
    //find via converting id objects to string because querying with id's doesn't work
    const likedPostIndex = post.likedby.findIndex(u => u._id.toString() === userId.toString());
    //check current like state
    const isCurrentlyLiked = likedPostIndex !== -1;
    
    //store previous state for potential rollback
    setPreviousLikeState(isCurrentlyLiked);
    
    //optimistically update UI immediately
    setCurrentUserLikedPost(!isCurrentlyLiked);
    setOptimisticLikeCount(isCurrentlyLiked ? post.likeCount - 1 : post.likeCount + 1);
    
    return !isCurrentlyLiked; // return new like state
  }
  
  //handle optimistic follow update
  function handleOptimisticFollow(userToFollow, currentUser) {
    if (!currentUser || !userToFollow) return;
    
    //check if current user is following this user already
    const isCurrentlyFollowing = currentUser.followingtheseID && 
      currentUser.followingtheseID.includes(userToFollow._id);
    
    return !isCurrentlyFollowing; // return new follow state
  }
  
  //set optimistic follow state with slight delay
  function setOptimisticFollowState(userToFollow, isFollowing, optimisticFollowState, setOptimisticFollowState) {
    setTimeout(() => {
      //make a copy of existing state object
      const newOptimisticState = Object.assign({}, optimisticFollowState);
      //set the follow state for this user
      newOptimisticState[userToFollow._id] = isFollowing;
      //update state with new object
      setOptimisticFollowState(newOptimisticState);
    }, 200);
  }
  
  //revert optimistic update if api call fails
  function revertOptimisticLike(post, previousLikeState, setCurrentUserLikedPost, setOptimisticLikeCount) {
    setCurrentUserLikedPost(previousLikeState);
    setOptimisticLikeCount(post.likeCount);
  }
  
  //revert optimistic follow if api call fails
  function revertOptimisticFollow(userToFollow, optimisticFollowState, setOptimisticFollowState, followErrors, setFollowErrors) {
    //make a copy of existing state object
    const newOptimisticState = Object.assign({}, optimisticFollowState);
    //remove this user's entry from optimistic state
    delete newOptimisticState[userToFollow._id];
    setOptimisticFollowState(newOptimisticState);
    
    //set error message
    const newErrors = Object.assign({}, followErrors);
    newErrors[userToFollow._id] = 'Failed to follow user';
    setFollowErrors(newErrors);
  }
  
  export {
    handleOptimisticLike,
    handleOptimisticFollow,
    setOptimisticFollowState,
    revertOptimisticLike,
    revertOptimisticFollow
  };