//user data API calls
import { fetchWithAuth } from './apiService';

/**
 * Promises in js represent the eventual completion or failure of an asynchronous operation 
 * and its resulting value. They provide a cleaner way to handle asynchronous operations compared to callbacks.
 * 
 * we implement REQUEST DEDUPLICATION for the getAllUsers and getFollowerData functions. 
 * Request deduplication prevents multiple components from 
 * triggering redundant network requests for the same data at the same time.
 * 
 * The technique works by:
 * - Storing the active Promise in a module-level variable (usersPromise) or map (followerDataPromises)
 * - Returning the existing Promise if one is already in progress
 * - Creating a new Promise only when needed
 * - Clearing the stored Promise once it completes (with a small delay)
 * 
 * This approach prevents the common React issue of duplicate API calls that can occur (and was occurring in the initial implementation) due to:
 * - Multiple components requesting the same data
 * - React StrictMode causing double-invocation of effects in development
 * - Complex state updates triggering multiple effect runs
 */

//variable that stores the current promise for the users request
//when null, no request is in flight
//when set to a Promise, a request is currently in progress
let usersPromise = null;

//map that stores current promises for follower data requests by shortId
//when empty for a key, no request for that shortId is in flight
//when set to a Promise, a request is currently in progress
//we use a Map (instead of a simple variable) because getFollowerData has a shortId parameter and we need to track multiple 
//potential requests simultaneously based on different shortId's.
//this allows to deduplicate requests for each specific call independently
const followerDataPromises = new Map();


//get all users
function getAllUsers() {
  //check if a request is already in progress
  //if usersPromise is not null, a request is already happening,
  //so return the existing promise instead of making a new request
  if (usersPromise) {
    return usersPromise;
  }
  //create and store the new promise in usersPromise variable so other calls can reuse it
  usersPromise = fetchWithAuth('/getallusers', {
    method: 'GET',
  }).then(data => {
    //reset promise after a small delay
    //the delay ensures that any near-simultaneous calls that happen right after
    //this one completes will still use the cached result instead of creating a new request
    setTimeout(() => { usersPromise = null }, 100);
    return data;
  }).catch(error => {
    //reset the promise immediately on error so future calls will try again
    //instead of reusing a failed request
    usersPromise = null;
    throw error;
  });
  
  //return the promise so the caller can attach .then/.catch handlers
  return usersPromise;
}

//get followers data for a user
function getFollowerData(shortId) {
  //check if a request for this shortId is already in progress
  //if followerDataPromises has this shortId, a request is already happening,
  //so return the existing promise instead of making a new request
  if (followerDataPromises.has(shortId)) {
    return followerDataPromises.get(shortId);
  }
  
  //create a new promise for this shortId
  const promise = fetchWithAuth(`/followers/${shortId}`, {
    method: 'GET',
  }).then(data => {
    //reset promise after a small delay
    //the delay ensures that any near-simultaneous calls that happen right after
    //this one completes will still use the cached result instead of creating a new request
    setTimeout(() => { followerDataPromises.delete(shortId) }, 100);
    return data;
  }).catch(error => {
    //reset the promise immediately on error so future calls will try again
    //instead of reusing a failed request
    followerDataPromises.delete(shortId);
    throw error;
  });
  
  //store the promise in the map so other calls for the same shortId can reuse it
  followerDataPromises.set(shortId, promise);
  
  //return the promise so the caller can attach .then/.catch handlers
  return promise;
}

//update user profile
function updateUserProfile(userId, profileData) {
  return fetchWithAuth(`/editprofile/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
}

//upload profile picture
function uploadProfileImage(userId, formData) {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/uploadprofilepic/${userId}`, {
    method: "POST",
    body: formData,
  }).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  });
}

export {
  getFollowerData,
  getAllUsers,
  updateUserProfile,
  uploadProfileImage
};