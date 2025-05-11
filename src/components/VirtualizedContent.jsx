/* eslint-disable react/prop-types */

//virtualized content component that conditionally renders full or simplified content based on viewport visibility
//improves performance by only rendering full content when the item is visible or near-visible
//maintains DOM structure and dimensions to prevent layout shifts during scrolling

import { useContentVirtualization } from '../utilities/contentVirtualizationUtils';
import { useState, useEffect, useRef } from 'react';

function VirtualizedContent({ 
  children,                  //the full content to render when visible
  placeholder,               //simplified content to render when not visible
  initiallyVisible = false,  //whether to start with content visible
  cacheTimeout = 30000,      //how long to keep content in memory after scrolling away
  className = '',            //class to apply to container
  style = {},                //additional styles
  id,                        //optional id for container
  bufferSize = '200px'       //how far from viewport to start loading content
}) {
  //use the virtualization hook to determine if content should be visible
  const { isContentLoaded, elementRef, isIntersecting } = useContentVirtualization({
    initiallyVisible,
    bufferSize,
    cacheTimeout
  });
  
  //store the element's height to maintain consistent dimensions
  const [height, setHeight] = useState(null);
  const contentRef = useRef(null);
  
  //measure the content height when it's first loaded
  //this prevents layout shifts when content is unloaded
  useEffect(() => {
    if (isContentLoaded && contentRef.current && !height) {
      const observer = new ResizeObserver(entries => {
        //get the first entry (our content element)
        const entry = entries[0];
        //extract height from border box (includes padding and border)
        if (entry) {
          setHeight(entry.borderBoxSize[0]?.blockSize || entry.target.offsetHeight);
        }
      });
      
      //start observing the content element
      observer.observe(contentRef.current);
      
      //cleanup: stop observing on unmount
      return () => observer.disconnect();
    }
  }, [isContentLoaded, height]);
  
  //combine base styles with any provided styles
  const containerStyle = {
    ...style,
    //maintain height if we have a measurement and content is not loaded
    ...(height && !isContentLoaded ? { minHeight: `${height}px` } : {})
  };
  
  return (
    //attach the ref to the container for intersection detection
    <div 
      ref={elementRef} 
      className={`virtualized-content ${className}`} 
      style={containerStyle}
      id={id}
      data-virtualized="true"
      data-visible={isIntersecting}
      data-loaded={isContentLoaded}
    >
      {isContentLoaded ? (
        //render full content when content should be loaded
        <div ref={contentRef}>
          {children}
        </div>
      ) : (
        //render placeholder when content should not be loaded
        <div className="virtualized-content-placeholder">
          {placeholder || null}
        </div>
      )}
    </div>
  );
}

export default VirtualizedContent;