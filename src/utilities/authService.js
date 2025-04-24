//authentication related API calls
import { fetchWithAuth } from './apiService';

/**
 * Promises in js represent the eventual completion or failure of an asynchronous operation 
 * and its resulting value. They provide a cleaner way to handle asynchronous operations compared to callbacks.
 * 
 * we implement REQUEST DEDUPLICATION for the getCurrentUser and getUserByShortId functions. 
 * Request deduplication prevents multiple components from 
 * triggering redundant network requests for the same data at the same time.
 * 
 * The technique works by:
 * - Storing the active Promise in a module-level variable (currentUserPromise) or map (userByShortIdPromises)
 * - Returning the existing Promise if one is already in progress
 * - Creating a new Promise only when needed
 * - Clearing the stored Promise once it completes (with a small delay)
 * 
 * This approach prevents the common React issue of duplicate API calls that can occur (and was occurring in the initial implementation) due to:
 * - Multiple components requesting the same data
 * - React StrictMode causing double-invocation of effects in development
 * - Complex state updates triggering multiple effect runs
 */

//variable that stores the current promise for the current user request
//when null, no request is in flight
//when set to a Promise, a request is currently in progress
let currentUserPromise = null;

//map that stores current promises for user by shortId requests
//when empty for a key, no request for that shortId is in flight
//when set to a Promise, a request is currently in progress
//we use a Map (instead of a simple variable) because getUserByShortId has a shortId parameter and we need to track multiple 
//potential requests simultaneously based on different shortId's.
//this allows to deduplicate requests for each specific call independently
const userByShortIdPromises = new Map();

//get current authenticated user
function getCurrentUser() {
  //check if a request is already in progress
  //if currentUserPromise is not null, a request is already happening,
  //so return the existing promise instead of making a new request
  if (currentUserPromise) {
    return currentUserPromise;
  }
  
  //create and store the new promise in currentUserPromise variable so other calls can reuse it
  currentUserPromise = fetchWithAuth('/login/success', {
    method: 'GET',
  }).then(data => {
    //reset promise after a small delay
    //the delay ensures that any near-simultaneous calls that happen right after
    //this one completes will still use the cached result instead of creating a new request
    setTimeout(() => { currentUserPromise = null }, 100);
    return data;
  }).catch(error => {
    //reset the promise immediately on error so future calls will try again
    //instead of reusing a failed request
    currentUserPromise = null;
    throw error;
  });
  
  //return the promise so the caller can attach .then/.catch handlers
  return currentUserPromise;
}

//get user by short id
function getUserByShortId(shortId) {
  //check if a request for this shortId is already in progress
  //if userByShortIdPromises has this shortId, a request is already happening,
  //so return the existing promise instead of making a new request
  if (userByShortIdPromises.has(shortId)) {
    return userByShortIdPromises.get(shortId);
  }
  
  //create a new promise for this shortId
  const promise = fetchWithAuth(`/profile-shortId/${shortId}`, {
    method: 'GET',
  }).then(data => {
    //reset promise after a small delay
    //the delay ensures that any near-simultaneous calls that happen right after
    //this one completes will still use the cached result instead of creating a new request
    setTimeout(() => { userByShortIdPromises.delete(shortId) }, 100);
    return data;
  }).catch(error => {
    //reset the promise immediately on error so future calls will try again
    //instead of reusing a failed request
    userByShortIdPromises.delete(shortId);
    throw error;
  });
  
  //store the promise in the map so other calls for the same shortId can reuse it
  userByShortIdPromises.set(shortId, promise);
  
  //return the promise so the caller can attach .then/.catch handlers
  return promise;
}

//get user by id
function getUserById(userId) {
  return fetchWithAuth(`/profile/${userId}`, {
    method: 'GET',
  });
}

//login with email and password
function loginUser(email, password) {
  return fetchWithAuth('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

//register new user
function registerUser(name, email, password) {
  return fetchWithAuth('/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

//logout current user - return the raw response instead of using fetchWithAuth, as the raw response is required for the logout functions (to redirect to /login route afterwards)
function logoutUser() {
  return fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: "include"
  });
}

export { 
  getCurrentUser, 
  getUserById, 
  getUserByShortId,
  loginUser, 
  registerUser, 
  logoutUser 
};