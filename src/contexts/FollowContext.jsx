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
  
  const {currentUser, refreshCurrentUser} = useAuth();

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
      } finally {
        setLoadingFollow(false);
        //fetch an api call to get currentUser, in order to get the updated verison of follower/following lists of the currentUser
        if (currentUser) {
          refreshCurrentUser()
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