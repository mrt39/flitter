/* eslint-disable react/prop-types */

//follow context for managing user following relationships
import { createContext, useState, useContext, useEffect } from 'react';
import { toggleFollow } from '../utilities/followService';
import { useAuth } from './AuthContext';

const FollowContext = createContext();

function FollowProvider({ children }) {
  //follow states
  const [pressedFollow, setPressedFollow] = useState(false);
  const [usertoFollow, setUsertoFollow] = useState(null);
  const [loadingFollow, setLoadingFollow] = useState(false);

  //track whether the api call to fetch currentUser is pending
  const [userRefreshPending, setUserRefreshPending] = useState(false);

  //optimistic ui states
  const [optimisticFollowState, setOptimisticFollowState] = useState({}); //track optimistic follow state by user ID
  const [followErrors, setFollowErrors] = useState({}); //track API errors by user ID
  
  const {currentUser, refreshCurrentUser} = useAuth();

  //handle optimistic follow updates (for real time UI update)
  function handleOptimisticFollow(userToFollow) {
    if (!currentUser || !userToFollow) return;
    
    //check if current user is following this user already - returns true/false
    const isCurrentlyFollowing = currentUser.followingtheseID && 
      currentUser.followingtheseID.includes(userToFollow._id);
    
    //update optimistic state with slight delay
    setTimeout(() => {
      //make a copy of existing state object
      const newOptimisticState = Object.assign({}, optimisticFollowState);
      //toggle the follow state for this user
      newOptimisticState[userToFollow._id] = !isCurrentlyFollowing;
      //update state with new object
      setOptimisticFollowState(newOptimisticState);
    }, 200);
    
    //trigger API calls
    setUsertoFollow(userToFollow);
    setLoadingFollow(true);
    setPressedFollow(!pressedFollow);
  }

  //useEffect for handling follow
  useEffect(() => {
    async function followUser() {
      if (!currentUser || !usertoFollow) return;

      try {
        await toggleFollow(currentUser, usertoFollow);
        console.log("Followed/Unfollowed Successfully!");
        //wait for fetching the currentUser
        setUserRefreshPending(true);
      } catch (error) {
        console.error('Error:', error);

        //revert optimistic state on error
        const newOptimisticState = Object.assign({}, optimisticFollowState);
        //remove this user's entry from optimistic state
        delete newOptimisticState[usertoFollow._id];
        setOptimisticFollowState(newOptimisticState);
        
        // set error message
        const newErrors = Object.assign({}, followErrors);
        newErrors[usertoFollow._id] = error.message || 'Failed to follow user';
        setFollowErrors(newErrors);

      } finally {
        setLoadingFollow(false);
        //fetch an api call to get currentUser, in order to get the updated verison of follower/following lists of the currentUser
        if (currentUser) {
          refreshCurrentUser()
          .then(() => {
            //on successful api call, clear optimistic state since we have real data now
            const newOptimisticState = Object.assign({}, optimisticFollowState);
            // remove this user's entry from optimistic state
            delete newOptimisticState[usertoFollow._id];
            setOptimisticFollowState(newOptimisticState);
          })
          .catch(error => {
            console.error('Error refreshing user after follow:', error);
            setUserRefreshPending(false);
          });
        }
      }
    }

    //only trigger when loading is true
    if (loadingFollow) {
      followUser();
    }
  }, [pressedFollow]);

  //watch when api call to fetch currentUser is complete (reset userRefreshPending when currentUser changes)
  useEffect(() => {
    if (userRefreshPending) {
      setUserRefreshPending(false);
    }
  }, [currentUser]);

  const value = {
    pressedFollow,
    setPressedFollow,
    usertoFollow,
    setUsertoFollow,
    loadingFollow,
    setLoadingFollow,
    userRefreshPending,
    optimisticFollowState,
    followErrors,
    handleOptimisticFollow
  };

  return (
    <FollowContext.Provider value={value}>
      {children}
    </FollowContext.Provider>
  );
}

function useFollow() {
  return useContext(FollowContext);
}

export { FollowProvider, useFollow };