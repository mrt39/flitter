/* eslint-disable react/prop-types */

//content virtualization utilities for optimizing dom performance
//provides hooks and utilities to conditionally render full or simplified content based on viewport visibility
//implements the x-style approach of keeping post structure in dom but only loading heavy content when visible

import { useState, useRef, useEffect, useCallback } from 'react';

//hook for detecting when elements enter or exit the viewport using IntersectionObserver API
//this is more efficient than scroll events as it's handled by the browser at the native level
function useIntersectionObserver(options = {}) {
  //configure with sensible defaults that can be overridden
  const {
    root = null,           //viewport element (null = browser viewport)
    rootMargin = '200px',  //margin around viewport to pre-load elements before they become visible
    threshold = 0.1,       //trigger when 10% of element is visible
    enabled = true         //allow disabling observation
  } = options;
  
  //track if element is currently in viewport
  const [isIntersecting, setIsIntersecting] = useState(false);
  //ref to attach to the DOM element we want to observe
  const elementRef = useRef(null);
  //store the observer instance
  const observerRef = useRef(null);

  //create the observer callback that updates state when intersection changes
  const handleIntersection = useCallback((entries) => {
    //we only care about the first entry as we're observing a single element
    const [entry] = entries;
    //update state based on whether the element is now intersecting the viewport
    setIsIntersecting(entry.isIntersecting);
  }, []);

  //effect for creating and cleaning up the observer
  useEffect(() => {
    //don't create observer if feature is disabled
    if (!enabled) {
      return;
    }
    
    //disconnect any existing observer before creating a new one
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    //create a new IntersectionObserver instance
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root,
      rootMargin,
      threshold
    });
    
    //if we have a DOM element reference, start observing it
    const currentElement = elementRef.current;
    if (currentElement) {
      observerRef.current.observe(currentElement);
    }
    
    //cleanup function to disconnect observer when component unmounts
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, root, rootMargin, threshold, handleIntersection]);

  //return the state and ref to attach to component
  return { isIntersecting, elementRef };
}

//hook to manage content virtualization state based on visibility
//handles loading/unloading of heavy content and maintains sensible caching behavior
function useContentVirtualization(options = {}) {
  //define default options with ability to override
  const {
    initiallyVisible = false, //whether content should start as visible
    visibilityThreshold = 0.1, //percentage of element that must be visible to trigger loading
    bufferSize = '200px',     //preload content before it's fully visible
    cacheTimeout = 30000,     //time in ms to keep content in memory after leaving viewport
    enabled = true            //allow disabling virtualization
  } = options;
  
  //track if content is loaded and ready to display
  const [isContentLoaded, setIsContentLoaded] = useState(initiallyVisible);
  //track when content was last visible (for caching purposes)
  const lastVisibleTimestamp = useRef(initiallyVisible ? Date.now() : null);
  //timer for content unloading
  const unloadTimerRef = useRef(null);
  
  //intersection observer to detect visibility
  const { isIntersecting, elementRef } = useIntersectionObserver({
    threshold: visibilityThreshold,
    rootMargin: bufferSize,
    enabled
  });
  
  //effect for loading/unloading content based on intersection
  useEffect(() => {
    //when element comes into view
    if (isIntersecting) {
      //cancel any pending unload
      if (unloadTimerRef.current) {
        clearTimeout(unloadTimerRef.current);
        unloadTimerRef.current = null;
      }
      
      //load content immediately
      setIsContentLoaded(true);
      //update last visible timestamp for cache management
      lastVisibleTimestamp.current = Date.now();
    } 
    //when element leaves viewport
    else if (isContentLoaded) {
      //update last visible timestamp for cache management
      lastVisibleTimestamp.current = Date.now();
      
      //schedule content unloading after timeout (for cache)
      unloadTimerRef.current = setTimeout(() => {
        //check if enough time has passed since element was last visible
        const timeSinceLastVisible = Date.now() - lastVisibleTimestamp.current;
        if (timeSinceLastVisible >= cacheTimeout) {
          //unload content if cache timeout has elapsed
          setIsContentLoaded(false);
        }
      }, cacheTimeout);
    }
    
    //cleanup timers on unmount
    return () => {
      if (unloadTimerRef.current) {
        clearTimeout(unloadTimerRef.current);
      }
    };
  }, [isIntersecting, isContentLoaded, cacheTimeout]);
  
  //return everything needed to implement virtualization
  return {
    isContentLoaded,        //whether to render full or placeholder content
    elementRef,             //attach this to the container element
    isIntersecting          //current visibility state for additional logic
  };
}

export { useIntersectionObserver, useContentVirtualization };