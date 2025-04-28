//utility functions for infinite scrolling functionality
//loads more posts when scrolled to the bottom, with a 1.5-second delay

import { useState } from 'react';

//hook for managing infinite scroll state and logic
function useInfiniteScroll(initialCount, increment, delay = 1000) {
  
  const [visibleItems, setVisibleItems] = useState(initialCount); // initial amount of posts to show on screen
  const [loading, setLoading] = useState(false);  // track posts loading state

  //function to load more items
  function loadMoreItems() {    
    setLoading(true); //start loading the next set of posts
    
    // delay the loading of the next set of posts by 1 second
    setTimeout(() => {
      //increase the visible post count by the increment count (10)
      setVisibleItems(visibleItems + increment);
      setLoading(false); //end loading
    }, delay);
  }
  
  return {
    visibleItems,
    loading,
    loadMoreItems
  };
}

export {
  useInfiniteScroll
};