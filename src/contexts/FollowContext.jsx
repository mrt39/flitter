/* eslint-disable react/prop-types */

//follow context for managing user following relationships
import { createContext, useState, useContext, useEffect } from 'react';
import { toggleFollow } from '../utilities/followService';
import { useAuth } from './AuthContext';
import { 
  handleOptimisticFollow as utilHandleOptimisticFollow,
  setOptimisticFollowState as updateOptimisticState,
  revertOptimisticFollow
} from '../utilities/optimisticUpdateUtils';

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
    
    //prevent following yourself
    if (userToFollow._id === currentUser._id) return;
    
    //prevent action while loading or refreshing
    if (loadingFollow || userRefreshPending) return;
    
    //use utility function to determine new follow state
    const isFollowing = utilHandleOptimisticFollow(userToFollow, currentUser);
    
    //use utility function to set optimistic state
    updateOptimisticState(
      userToFollow, 
      isFollowing, 
      optimisticFollowState, 
      setOptimisticFollowState
    );
    
    //trigger API calls
    setUsertoFollow(userToFollow);
    setLoadingFollow(true);
    setPressedFollow(prev => !prev);
  }

  //useEffect for handling follow API calls
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

        //use utility function to revert optimistic state on error
        revertOptimisticFollow(
          usertoFollow,
          optimisticFollowState,
          setOptimisticFollowState,
          followErrors,
          setFollowErrors
        );
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