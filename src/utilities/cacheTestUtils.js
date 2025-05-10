//utility functions for testing the cache implementation
//provides methods to verify cache behavior and diagnose issues

//USAGE: de-comment the button component in App.jsx and click to run the tests.

import { 
  getCachedPosts, 
  getCachedPostById, 
  addPostToCache, 
  updatePostLikeInCache, 
  invalidateCache 
} from './postCacheService';
import { fetchWithAuth } from './apiService';

console.log('Cache test utilities loaded!');

//check if cache is working properly
function diagnoseCacheHealth() {
    //track performance metrics
    const startTime = performance.now();
    
    //make two sequential calls to getAllPosts
    //first call should go to server, second should use cache
    const testCache = async () => {
      try {
        //clear any existing module imports to ensure fresh test
        const { getAllPosts } = await import('./postService.js');
        
        //first call - should fetch from server
        console.time('First getAllPosts call');
        const firstCallResult = await getAllPosts();
        console.timeEnd('First getAllPosts call');
        
        //second call - should use cache
        console.time('Second getAllPosts call (should be cached)');
        const secondCallResult = await getAllPosts();
        console.timeEnd('Second getAllPosts call (should be cached)');
        
        //compare results
        const postsMatch = JSON.stringify(firstCallResult) === JSON.stringify(secondCallResult);
        
        //check performance improvement
        const firstCallTime = performance.now() - startTime;
        const secondCallTime = performance.now() - (startTime + firstCallTime);
        //calculate percentage improvement between first and second call
        const improvement = ((firstCallTime - secondCallTime) / firstCallTime) * 100;
        
        return {
          cacheWorking: secondCallTime < firstCallTime, //cache is working if second call is faster
          postsMatch, //confirm both calls return identical data
          firstCallTime, //time taken by first call (in ms)
          secondCallTime, //time taken by second call (in ms)
          improvement: improvement.toFixed(2) + '%' //improvement as percentage with 2 decimal places
        };
        
      } catch (error) {
        //return error information if test fails
        return {
          cacheWorking: false,
          error: error.message
        };
      }
    };
    
    //execute the test function and return its result
    return testCache();
}

//test cross-tab synchronization
async function testCrossTabSync() {
  //create a console group for better log organization
  console.group('🔄 Testing Cross-Tab Sync');
  console.log('Setting timestamp in localStorage...');
  
  //store the current timestamp to restore later
  const originalTimestamp = localStorage.getItem('flitter_cache_timestamp');
  
  //set a new timestamp (simulating another tab updating cache)
  const newTimestamp = Date.now();
  localStorage.setItem('flitter_cache_timestamp', newTimestamp.toString());
  
  //trigger a storage event manually to simulate cross-tab communication
  //this is needed because storage events don't fire in the same tab that makes the change
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'flitter_cache_timestamp',
    newValue: newTimestamp.toString(),
    oldValue: originalTimestamp,
  }));
  
  console.log('Storage event dispatched with new timestamp:', newTimestamp);
  console.log('Check if your app responds by refreshing data');
  console.log('Restoring original timestamp...');
  
  //restore original timestamp to avoid side effects
  if (originalTimestamp) {
    localStorage.setItem('flitter_cache_timestamp', originalTimestamp);
  } else {
    localStorage.removeItem('flitter_cache_timestamp');
  }
  
  //end the console group
  console.groupEnd();
  //return test results
  return { tested: true, timestamp: newTimestamp };
}

//test single post cache
async function testSinglePostCache(postId) {
  //create a console group for better log organization
  console.group('🔍 Testing Single Post Cache');
  
  //if no postId provided, try to get one from the API
  if (!postId) {
    console.log('No postId provided, fetching sample post...');
    try {
      //fetch all posts to get a sample post ID
      const posts = await fetchWithAuth('/getallposts', { method: 'GET' });
      if (posts && posts.length > 0) {
        //use the first post's ID for testing
        postId = posts[0]._id;
        console.log(`Using postId: ${postId}`);
      } else {
        //handle case where no posts are available
        console.error('No posts available to test');
        console.groupEnd();
        return { error: 'No posts available' };
      }
    } catch (error) {
      //handle API error
      console.error('Error fetching posts:', error);
      console.groupEnd();
      return { error: error.message };
    }
  }
  
  //log which post we're testing
  console.log(`Testing getCachedPostById for post: ${postId}`);
  
  //first call to get post - should fetch from API
  console.time('First getById call');
  const firstCall = await getCachedPostById(postId);
  console.timeEnd('First getById call');
  
  //second call - should use cache
  console.time('Second getById call (should be cached)');
  const secondCall = await getCachedPostById(postId);
  console.timeEnd('Second getById call (should be cached)');
  
  //compare results to ensure both calls return the same data
  const postsMatch = JSON.stringify(firstCall) === JSON.stringify(secondCall);
  console.log(`Posts match: ${postsMatch ? '✅ Yes' : '❌ No'}`);
  
  //end the console group
  console.groupEnd();
  
  //return test results
  return { 
    tested: true, 
    postId, //the ID of the post that was tested
    postsMatch, //whether both calls returned identical data
    post: secondCall //the post object itself for further testing
  };
}

//test cache invalidation
async function testCacheInvalidation() {
  //create a console group for better log organization
  console.group('🗑️ Testing Cache Invalidation');
  
  //first, make sure cache is populated
  console.log('Populating cache...');
  await getCachedPosts();
  
  //now invalidate the cache
  console.log('Invalidating cache...');
  invalidateCache();
  
  //check if localStorage timestamp was updated (the invalidation mechanism)
  const newTimestamp = localStorage.getItem('flitter_cache_timestamp');
  console.log(`New timestamp set: ${newTimestamp}`);
  
  //fetch again, which should hit the API since cache was invalidated
  console.log('Fetching posts after invalidation...');
  console.time('Post-invalidation fetch');
  await getCachedPosts();
  console.timeEnd('Post-invalidation fetch');
  
  console.log('Cache should be repopulated now');
  //end the console group
  console.groupEnd();
  
  //return test results
  return { tested: true, timestamp: newTimestamp };
}

//test like update in cache
async function testLikeUpdateInCache(postId, userId) {
  //create a console group for better log organization
  console.group('👍 Testing Like Update in Cache');
  
  //ensure both required parameters are provided
  if (!postId || !userId) {
    console.error('Both postId and userId are required');
    console.groupEnd();
    return { error: 'Missing postId or userId' };
  }
  
  //ensure cache is populated before testing
  console.log('Ensuring cache is populated...');
  const posts = await getCachedPosts();
  
  //find the specific post we want to test with
  const post = posts.find(p => p._id === postId);
  
  //handle case where post is not found in cache
  if (!post) {
    console.error(`Post ${postId} not found in cache`);
    console.groupEnd();
    return { error: 'Post not found in cache' };
  }
  
  //check if post is initially liked by the user
  const initiallyLiked = post.likedby.some(u => u._id === userId);
  console.log(`Initial like status: ${initiallyLiked ? 'Liked' : 'Not liked'}`);
  
  //toggle like status in cache (if liked -> unlike, if not liked -> like)
  console.log('Updating like status in cache...');
  updatePostLikeInCache(postId, userId, !initiallyLiked);
  
  //check if cache was updated correctly
  const updatedPosts = await getCachedPosts();
  const updatedPost = updatedPosts.find(p => p._id === postId);
  const newLikeStatus = updatedPost.likedby.some(u => u._id === userId);
  
  //log results
  console.log(`New like status: ${newLikeStatus ? 'Liked' : 'Not liked'}`);
  console.log(`Cache updated correctly: ${newLikeStatus !== initiallyLiked ? '✅ Yes' : '❌ No'}`);
  
  //restore original state to avoid side effects
  console.log('Restoring original like state...');
  updatePostLikeInCache(postId, userId, initiallyLiked);
  
  //end the console group
  console.groupEnd();
  
  //return test results
  return { 
    tested: true,
    postId, //the ID of the post that was tested
    userId, //the ID of the user that was used for testing
    likeToggled: newLikeStatus !== initiallyLiked //whether like status was successfully toggled
  };
}

//run all cache tests
async function runAllCacheTests(postId, userId) {
  //create main console group for all tests
  console.group('🧪 CACHE TESTING DASHBOARD');
  console.log('Starting comprehensive cache tests...');
  console.log('-----------------------------------');
  
  //TEST 1: basic cache health test
  console.log('1. Testing cache health...');
  const healthResult = await diagnoseCacheHealth();
  console.log(`   Cache working: ${healthResult.cacheWorking ? '✅' : '❌'}`);
  console.log(`   Performance improvement: ${healthResult.improvement}`);
  
  //TEST 2: single post cache test
  console.log('\n2. Testing single post cache...');
  const singlePostResult = await testSinglePostCache(postId);
  console.log(`   Test completed: ${singlePostResult.error ? '❌' : '✅'}`);
  
  //TEST 3: cache invalidation test
  console.log('\n3. Testing cache invalidation...');
  const invalidationResult = await testCacheInvalidation();
  console.log(`   Test completed: ${invalidationResult.error ? '❌' : '✅'}`);
  
  //TEST 4: like update test (only if userId is provided)
  if (userId) {
    console.log('\n4. Testing like update in cache...');
    const likeResult = await testLikeUpdateInCache(
      singlePostResult.postId || postId, //use the post ID from test 2 if available
      userId
    );
    console.log(`   Test completed: ${likeResult.error ? '❌' : '✅'}`);
  }
  
  //TEST 5: cross-tab synchronization test
  console.log('\n5. Testing cross-tab synchronization...');
  const syncResult = await testCrossTabSync();
  console.log(`   Test completed: ${syncResult.error ? '❌' : '✅'}`);
  
  //summary of all tests
  console.log('\n-----------------------------------');
  console.log('All tests completed!');
  console.groupEnd();
}


export { 
  diagnoseCacheHealth,
  testSinglePostCache,
  testCacheInvalidation,
  testLikeUpdateInCache,
  testCrossTabSync,
  runAllCacheTests
};

//debug logging for window.cacheTests setup
console.log('Setting up window.cacheTests...', typeof window);

//expose functions to window for console testing
//this allows running tests directly from browser console without importing
if (typeof window !== 'undefined') {
  try {
    //create global object with all testing functions
    window.cacheTests = {
      diagnoseCacheHealth,
      testSinglePostCache,
      testCacheInvalidation,
      testLikeUpdateInCache,
      testCrossTabSync,
      runAllCacheTests
    };
    //confirm successful creation of window.cacheTests
    console.log('window.cacheTests successfully created', window.cacheTests);
  } catch (error) {
    //log any errors that occur during setup
    console.error('Failed to create window.cacheTests:', error);
  }
}