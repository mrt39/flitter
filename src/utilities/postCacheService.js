//post cache service for storing and managing cached post data
//provides methods for retrieving posts from cache, updating cache, and cache invalidation
//implements cross-tab synchronization and handles race conditions

import { fetchWithAuth } from './apiService';

//cache configuration and storage
const postCache = {
  data: null,           //stores all posts
  lastFetchTime: null,  //timestamp for invalidation checking
  isFetching: false,    //prevents concurrent fetch requests
  maxAge: 5 * 60 * 1000 //5 minutes cache validity to prevent stale data
};

//local storage key for cross-tab synchronization
const CACHE_TIMESTAMP_KEY = 'flitter_cache_timestamp';

//get all posts with cache support
async function getCachedPosts() {
  //first check if we have valid cache data in this browser tab
  //if cache is valid and not stale, return it
  if (postCache.data && 
      postCache.lastFetchTime && 
      (Date.now() - postCache.lastFetchTime < postCache.maxAge)) {
    //create a new array with the same content and return it, which is a copy of the data, instead of the original
    //this prevents external code from modifying cache
    return [...postCache.data]; 
  }
  
  //check if another tab has newer data (by comparing timestamps)
  const storedTimestamp = getStoredTimestamp();
  if (storedTimestamp && postCache.lastFetchTime && storedTimestamp > postCache.lastFetchTime) {
    //another tab has newer data, invalidate this cache instance and force a refresh
    postCache.lastFetchTime = null;
    postCache.data = null;
  }
  
  //if already fetching, avoid duplicate requests by waiting for current request
  if (postCache.isFetching) {
  //in a situation where another part of the code is already fetching posts
  //instead of starting another request, wait for that one to finish

  //create a function that will repeatedly check if the fetching is done
  function waitForExistingFetch() {
    //if fetching is complete, return the data
    if (!postCache.isFetching) {
      return [...postCache.data]; //return a copy of the fetched data
    }

    //while fetching is still in progress (postCache.isFetching is true), create a new promise to handle the asynchronous waiting process
    //a promise is required because getCachedPosts is an async function, it expects waitForExistingFetch to return a Promise that can be awaited. This Promise ensures that getCachedPosts pauses execution until the fetch completes and returns the cached data.
    //without a promise, waitForExistingFetch would return undefined, breaking the async/await flow in getCachedPosts.
    return new Promise(resolve => { //otherwise, wait 100ms and check again
      //wait 100 milliseconds, then check again
      setTimeout(() => {
        //when checking again, either return the data or continue waiting
        resolve(waitForExistingFetch());
      }, 100);
    });

  }
  //start the waiting process
  return waitForExistingFetch();
}
  
  //mark as fetching to prevent duplicate requests
  postCache.isFetching = true;
  
  try {
    //fetch from API since cache is invalid or empty
    const posts = await fetchWithAuth('/getallposts', { method: 'GET' });
    
    //update cache in memory
    postCache.data = posts;

    //update the timestamp for when THIS tab last fetched data
    postCache.lastFetchTime = Date.now();
    
    //update timestamp in localStorage so other tabs open can detect our update
    //this is the cross-tab communication mechanism
    setStoredTimestamp(postCache.lastFetchTime);
    
    //finish fetching state
    postCache.isFetching = false;
    
    //return a copy of the data, not the reference to cache
    return [...postCache.data]; 
  } catch (error) {
    //reset fetching state on error
    postCache.isFetching = false;
    throw error; 
  }
}

//get a single post by ID from cache or API
function getCachedPostById(postId) {
  //check if cache has posts
  if (postCache.data) {
    //search for the post in our cached data
    const post = postCache.data.find(post => post._id === postId);
    if (post) {
      //wrap post in a Promise to ensure consistent return type
      //this is critical for ensuring functions that use getCachedPostById can always use .then()
      //regardless of whether the post comes from cache or from an API call
      return Promise.resolve({...post});
    }
  }
  
  //if not in cache or cache is empty, fetch from API
  return fetchWithAuth(`/getsingularpost/${postId}`, {
    method: 'GET',
  });
}

//add a new post to cache
function addPostToCache(post) {
  if (!postCache.data) return;

  //check if this post already exists in cache
  const existingPostIndex = postCache.data.findIndex(p => p._id === post._id);

  if (existingPostIndex !== -1) {
    //update existing post in cache
    postCache.data[existingPostIndex] = post;
  } else {
    //add the new post to beginning of array to match API sort order (most recent first)
    postCache.data = [post, ...postCache.data];
  }

  //update timestamp for cross-tab sync so other tabs know our data changed
  setStoredTimestamp(Date.now());
}

//update post like status in cache
function updatePostLikeInCache(postId, userId, isLiking) {
  if (!postCache.data) return;
  
  //find the post in our cache by ID
  const postIndex = postCache.data.findIndex(post => post._id === postId);
  //if post not found in cache (-1), exit early
  if (postIndex === -1) return;
  
  //create a copy of the post to avoid direct mutations to cache
  const post = postCache.data[postIndex];
  const updatedPost = {...post};
  
  if (isLiking) {
    //add user to likedby if not already there
    if (!updatedPost.likedby.some(user => user._id === userId)) {
      updatedPost.likedby.push({ _id: userId });
      updatedPost.likeCount += 1;
    }
  } else {
    //remove user from likedby
    const userIndex = updatedPost.likedby.findIndex(user => user._id === userId);
    if (userIndex !== -1) {
      updatedPost.likedby.splice(userIndex, 1);
      updatedPost.likeCount -= 1;
    }
  }
  
  //update cache with modified post
  postCache.data[postIndex] = updatedPost;
  
  //update timestamp so other tabs know our data changed
  setStoredTimestamp(Date.now());
}

//force cache invalidation
function invalidateCache() {
  postCache.lastFetchTime = null;
  postCache.data = null;
  setStoredTimestamp(Date.now());
}

//get timestamp from local storage
function getStoredTimestamp() {
  try {
    //read the timestamp that tracks when ANY tab last updated the cache
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    //handle case where localStorage is unavailable (private browsing, etc)
    return null;
  }
}

//store timestamp in local storage
function setStoredTimestamp(timestamp) {
  try {
    //update the timestamp that tracks when ANY tab last updated the cache
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
  } catch (error) {
    //handle case where localStorage is unavailable
    console.warn('Unable to store cache timestamp in localStorage');
  }
}

export {
  getCachedPosts,
  getCachedPostById,
  addPostToCache,
  updatePostLikeInCache,
  invalidateCache,
};