//utility functions for handling media content, link previews and youtube embeds

/* link preview caching system:
this file implements a link preview caching mechanism that:
- stores fetched preview data in localStorage to prevent redundant api calls
- uses a key-value structure with the url as key and preview data as value
- includes timestamp with each cache entry to enable expiration policies
- only stores essential preview data (url, title, description, image) to minimize storage use
- checks cache before making api calls to improve performance and reduce api usage */

//extract youtube video id from url
function extractYouTubeID(url) {
  if (!url) return null;
  
  //different youtube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/user\/.+\/|youtube\.com\/user\/.+\#\w\/\w\/|youtube\.com\/shorts\/)([^#\&\?\n]*)/,
    /youtube\.com\/watch\?.*v=([^#\&\?\n]*)/,
    /youtube\.com\/embed\/([^#\&\?\n]*)/,
    /youtube\.com\/v\/([^#\&\?\n]*)/,
    /youtu\.be\/([^#\&\?\n]*)/,
    /youtube\.com\/user\/.*\/videos\/([^#\&\?\n]*)/,
    /youtube\.com\/user\/.*\#([^\/]*\/[^#\&\?\n]*)/
  ];

  for (let pattern of patterns) {
  //match the patterns with the url
    const match = url.match(pattern);
    if (match && match[1]) {
      //if match found, return the youtube url
      return match[1];
    }
  }
  //otherwise, return null
  return null;
}
  
//function to extract the first URL from the post content
function extractURLFromContent(content) {
  if (!content) return null;

  //regex to match URLs in text
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = content.match(urlRegex);
  
  //return the first URL found or null if none
  return matches && matches.length > 0 ? matches[0] : null;
}

//utility functions for link preview caching
//check if a preview exists in cache for a given url
function getPreviewFromCache(url) {
  try {
    const cachedData = localStorage.getItem(`preview_${url}`);
    //if it exists, return it
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      
      //check if cache is older than 30 days
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      if (parsedData.timestamp && Date.now() - parsedData.timestamp > thirtyDaysInMs) {
        //cache expired, return null to trigger a fresh fetch
        return null;
      }
      
      return parsedData;
    }

    return null;
  } catch (error) {
    //if any error occurs while retrieving from cache, return null
    console.error('cache retrieval error:', error);
    return null;
  }
}
  
//save preview data to cache
function savePreviewToCache(url, data) {
  try {
    //add timestamp to track when the preview was cached
    const cacheEntry = {
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(`preview_${url}`, JSON.stringify(cacheEntry));
  } catch (error) {
    //log error without disrupting user experience if caching fails
    console.error('cache saving error:', error);
  }
}

//create a basic preview from url when preview api fails
function createBasicPreview(url) {
  try {
    const urlObj = new URL(url);
    return {
      url: url,
      title: urlObj.hostname.replace('www.', ''),
      description: urlObj.pathname.length > 1 ? urlObj.pathname : 'Homepage',
      //use images array format to match expected structure
      images: [`https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`],
      success: true
    };
  } catch (error) {
    return { url, success: false };
  }
}

//create youtube preview without using the api
function createYouTubePreview(url, youtubeId) {
  try {
    //create structured data that matches the render format
    return {
      url: url,
      title: 'YouTube Video',
      description: url,
      //use youtube thumbnail as preview image
      images: [`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`],
      youtubeId: youtubeId, //add youtubeId for easy reference
      success: true
    };
  } catch (error) {
    return { url, success: false };
  }
}
  
//fetch link preview data for a url, from the api
async function fetchLinkPreview(url) {
  
  //first check if preview is already cached
  const cachedPreview = getPreviewFromCache(url);
  if (cachedPreview) {
    return cachedPreview;
  }

  //check if url is a youtube link
  const youtubeID = extractYouTubeID(url);
  if (youtubeID) {
    //for youtube links, create preview without api call
    const youtubePreview = createYouTubePreview(url, youtubeID);
    //cache the youtube preview
    savePreviewToCache(url, youtubePreview);
    return youtubePreview;
  }


  try {
    //use opengraph.io api to fetch link preview
    const apiKey = import.meta.env.VITE_LINKPREVIEW_API_KEY;
    const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`;
    
    try {
      //use a direct fetch with CORS headers
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      
      //check for hybridGraph instead of success property - due to how opengraph api works
      if (!data.title) {
        throw new Error('API response missing required data');
      }

      //extract rich metadata from API response
      const previewData = {
        url: url,
        title: data.title || new URL(url).hostname,
        description: data.description || '',
        images: data.image ? [data.image] : [],
        success: true
      };
      
      //cache the preview data for future use
      savePreviewToCache(url, previewData);
      
      return previewData;
    } catch (fetchError) {
      console.error('UTILS: Fetch error details:', fetchError.message);
      throw fetchError; //throw to be handled by outer try/catch
    }
  } catch (error) {
    console.error('UTILS: Error in fetchLinkPreview:', error.message);
    //if api call fails, try to create a basic preview
    const basicPreview = createBasicPreview(url);
    //cache the basic preview to avoid repeated failures
    if (basicPreview.success) {
      savePreviewToCache(url, basicPreview);
    }
    return basicPreview;
  }
}
  
export {
  extractYouTubeID,
  extractURLFromContent,
  fetchLinkPreview,
};