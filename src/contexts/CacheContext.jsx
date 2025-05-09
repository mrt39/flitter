//contexts for managing cache states and invalidation events
//handles periodic cache invalidation to prevent stale data

/* eslint-disable react/prop-types */
import { createContext, useState, useContext, useEffect } from 'react';
import { invalidateCache } from '../utilities/postCacheService';

//create context
const CacheContext = createContext();

function CacheProvider({ children }) {
  //cache control states
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(false);
  
  //cache invalidation settings fpr how often to refresh cache automatically
  const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000); // 5 minutes
  
  //manually trigger cache refresh
  function refreshCache() {
    invalidateCache(); //clear the cache in postCacheService
    setForceRefresh(prev => !prev);
  }
  
  //listen for storage events for cross-tab synchronization
  useEffect(() => {
    //this function will be called whenever localStorage changes in ANOTHER tab
    function handleStorageChange(event) {
      //check if the changed item is our app's cache timestamp key
      if (event.key === 'flitter_cache_timestamp') {
        //trigger refresh to get the latest data
        setForceRefresh(prev => !prev);
      }
    }
    
    //add event listener for storage events
    //this eventlistener gets called when another tab changes localstorage
    window.addEventListener('storage', handleStorageChange);
    
    //cleanup function to remove the listener when component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  //auto-refresh cache periodically while site is active
  useEffect(() => {
    //skip if cache is disabled or interval is set to zero/negative
    if (!cacheEnabled || refreshInterval <= 0) return;
    
    //set up a timer to refresh cache at an interval
    //prevents data from becoming stale during long sessions
    const intervalId = setInterval(() => {
      //invalidate the cache, forcing the next data request to use an api call
      invalidateCache();
      //trigger a refresh in components that use the cache
      setForceRefresh(prev => !prev);
    }, refreshInterval);
    
    //cleanup function to clear the timer when component unmounts or dependencies change
    return () => clearInterval(intervalId);
  }, [cacheEnabled, refreshInterval]);
  
  const value = {
    cacheEnabled,
    setCacheEnabled,
    forceRefresh, 
    refreshCache,
    refreshInterval,
    setRefreshInterval
  };
  
  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
}

function useCache() {
  return useContext(CacheContext);
}

export { CacheProvider, useCache };