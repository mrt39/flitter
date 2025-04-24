//post-related API calls
import { fetchWithAuth } from './apiService';

/**
 * Promises in js represent the eventual completion or failure of an asynchronous operation 
 * and its resulting value. They provide a cleaner way to handle asynchronous operations compared to callbacks.
 * 
 * we implement REQUEST DEDUPLICATION for the getAllPosts function. 
 * Request deduplication prevents multiple components from 
 * triggering redundant network requests for the same data at the same time.
 * 
 * The technique works by:
 * - Storing the active Promise in a module-level variable (postsPromise)
 * - Returning the existing Promise if one is already in progress
 * - Creating a new Promise only when needed
 * - Clearing the stored Promise once it completes (with a small delay)
 * 
 * This approach prevents the common React issue of duplicate API calls that can occur (and was occuring in the initial implementation) due to:
 * - Multiple components requesting the same data
 * - React StrictMode causing double-invocation of effects in development
 * - Complex state updates triggering multiple effect runs
 */

//variable that stores the current promise for the posts request
//when null, no request is in flight
//when set to a Promise, a request is currently in progress
let postsPromise = null;

//map that stores current promises for single post requests by postId
//when empty for a key, no request for that postId is in flight
//when set to a Promise, a request is currently in progress
//we use a Map (instead of a simple variable) because getSinglePost has a postId parameter and we need to track multiple 
//potential requests simultaneously based on different postId's.
//this allows to deduplicate requests for each specific call independently
const singlePostPromises = new Map();

//get all posts
function getAllPosts() {
  //check if a request is already in progress
  //if postsPromise is not null, a request is already happening,
  //so return the existing promise instead of making a new request
  if (postsPromise) {
    return postsPromise;
  }
  //create and store the new promise in postPromise variable so other calls can reuse it
  postsPromise = fetchWithAuth('/getallposts', {
    method: 'GET',
  }).then(data => {
    //sort data by dates, descending order
    const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    //reset promise after a small delay
    //the delay ensures that any near-simultaneous calls that happen right after
    //this one completes will still use the cached result instead of creating a new request
    setTimeout(() => { postsPromise = null }, 100);
    return sortedData;
  }).catch(error => {
    //reset the promise immediately on error so future calls will try again
    //instead of reusing a failed request
    postsPromise = null;
    throw error;
  });
  //return the promise so the caller can attach .then/.catch handlers
  return postsPromise;
}

//get a single post by id
function getSinglePost(postId) {
  //check if a request for this postId is already in progress
  //if singlePostPromises has this postId, a request is already happening,
  //so return the existing promise instead of making a new request
  if (singlePostPromises.has(postId)) {
    return singlePostPromises.get(postId);
  }
  
  //create a new promise for this postId
  const promise = fetchWithAuth(`/getsingularpost/${postId}`, {
    method: 'GET',
  }).then(data => {
    //reset promise after a small delay
    //the delay ensures that any near-simultaneous calls that happen right after
    //this one completes will still use the cached result instead of creating a new request
    setTimeout(() => { singlePostPromises.delete(postId) }, 100);
    return data;
  }).catch(error => {
    //reset the promise immediately on error so future calls will try again
    //instead of reusing a failed request
    singlePostPromises.delete(postId);
    throw error;
  });
  
  //store the promise in the map so other calls for the same postId can reuse it
  singlePostPromises.set(postId, promise);
  
  //return the promise so the caller can attach .then/.catch handlers
  return promise;
}

//submit a new text post
function submitPost(user, message) {
  return fetchWithAuth('/submitPost', {
    method: "POST",
    body: JSON.stringify({ 
      from: user, 
      date: new Date().toISOString(), 
      message: message 
    }),
  });
}

//submit an image post
function submitImagePost(formData) {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/imagesent`, {
    method: "POST",
    body: formData,
    credentials: "include"
  }).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  });
}

//like a post
function likePost(user, postId) {
  return fetchWithAuth('/likePost', {
    method: "PATCH",
    body: JSON.stringify({ 
      postID: postId, 
      likedBy: user
    }),
  });
}

//comment on a post
function commentOnPost(user, postId, comment) {
  return fetchWithAuth('/sendCommentonPost', {
    method: "POST",
    body: JSON.stringify({ 
      from: user, 
      toPostID: postId, 
      date: new Date().toISOString(), 
      comment: comment
    }),
  });
}

export {
  getAllPosts,
  getSinglePost,
  submitPost,
  submitImagePost,
  likePost,
  commentOnPost
};