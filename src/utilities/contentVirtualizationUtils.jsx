/* eslint-disable react/prop-types */

//this file contains two main hooks for content virtualization:
//
//1. useIntersectionObserver:
//this hook detects when elements become visible in the viewport (browser window).
//it uses the browser's IntersectionObserver API which is more efficient than scroll events.
//how it works:
//-you give it a reference to your component
//-it watches when that component enters or leaves the screen
//-it returns a boolean (isIntersecting) that tells you if it's visible
//-it also returns a ref (elementRef) that you attach to your component
//
//key benefits:
//-saves resources by not using scroll events
//-handles all the complex calculations about element visibility
//-allows setting a buffer zone to preload content before it's fully visible
//
//2. useContentVirtualization:
//this hook builds on useIntersectionObserver to create a complete virtualization system.
//it helps optimize performance by only rendering the full version of content when needed.
//
//how it works:
//-decides whether to render full content or a placeholder
//-keeps track of when content was last visible
//-implements a caching system that keeps content loaded for a while after scrolling away
//-automatically handles loading/unloading based on visibility
//
//key features:
//-caching system prevents flickering when scrolling back to recently viewed content
//-works with any component that needs virtualization
//-returns simple boolean flags for components to use in their render logic
//
//these hooks work together to create an efficient system that improves performance
//by reducing the amount of DOM content that needs to be rendered at any given time.

import { useState, useRef, useEffect, useCallback } from 'react';

//hook for detecting when elements enter or exit the viewport using IntersectionObserver API
//this is more efficient than scroll events as it's handled by the browser at the native level
function useIntersectionObserver(options = {}) {
  //configure with default settings
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
  //ref to store the observer instance
  const observerRef = useRef(null);

  //create the observer callback that updates state when viewport changes
  //using a useCallback here to prevent change between renders
  const handleIntersection = useCallback((entries) => {
    //entries will be an array of objects provided by the browser's IntersectionObserver api
    //we only care about the first entry as we're observing a single element
    const [entry] = entries;
    //entry.isIntersecting is accessing a standard property of the IntersectionObserverEntry object
    //it's not referring to isIntersecting state variable with the same name
    //this property is a boolean that indicates whether the observed element is intersecting with the viewport
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

    //intersectionObserver is a browser API that efficiently detects when an element intersects with the viewport or another specified element
    //it is used here, as it's more performance-efficient than scroll listeners and handles all the complex intersection calculations by itself
    //here, it's used to determine when elements enter or leave the viewport, which is required for the content virtualization system (only rendering full content when visible)
    //the observer calls the handleIntersection callback function defined here, with information about intersection changes
    observerRef.current = new IntersectionObserver(handleIntersection, { //create a new IntersectionObserver instance in observerRef
      root,
      rootMargin,
      threshold
    });
    
    //if we have a DOM element reference, start observing it
    const currentElement = elementRef.current;
    if (currentElement) {
      //.observe(element) tells the IntersectionObserver to start watching a specific DOM element
      observerRef.current.observe(currentElement);
    }
    
    //cleanup function to disconnect observer when component unmounts
    return () => {
      if (observerRef.current) {
        //.disconnect() tells the observer to stop watching all targets
        observerRef.current.disconnect();
      }
    };
  }, [enabled, root, rootMargin, threshold, handleIntersection]);

  //return the state and ref to attach to component
  return { isIntersecting, elementRef };
}

//hook to manage content virtualization state based on visibility
//handles loading/unloading of heavy content and maintains caching behavior
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
  //track when content was last visible (for caching purposes), using useRef here to prevent change between renders
  const lastVisibleTimestamp = useRef(initiallyVisible ? Date.now() : null);
  //timer for content unloading
  const unloadTimerRef = useRef(null);
  
  //get the ref (elementRef) to attach to the DOM element we want to monitor
  //get he boolean (isIntersecting) which shows if the element is currently visible
  const { isIntersecting, elementRef } = useIntersectionObserver({ //intersection observer to detect visibility
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