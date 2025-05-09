//utility functions for testing the cache implementation
//provides methods to verify cache behavior and diagnose issues

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
        const improvement = ((firstCallTime - secondCallTime) / firstCallTime) * 100;
        
        return {
          cacheWorking: secondCallTime < firstCallTime,
          postsMatch,
          firstCallTime,
          secondCallTime,
          improvement: improvement.toFixed(2) + '%'
        };
        
      } catch (error) {
        return {
          cacheWorking: false,
          error: error.message
        };
      }
    };
    
    return testCache();
  }
  
  export { diagnoseCacheHealth };