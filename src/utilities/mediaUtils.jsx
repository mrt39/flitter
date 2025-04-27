//utility functions for handling media content, link previews and youtube embeds

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
  
  //fetch link preview data for a url
  async function fetchLinkPreview(url) {
    try {
      const response = await fetch(`https://api.linkpreview.net/?key=123123123&q=${url}`);
      if (!response.ok) throw new Error('Failed to fetch link preview');
      
      const data = await response.json();
      return {
        url: data.url,
        title: data.title,
        description: data.description,
        image: data.image,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching link preview:', error);
      return {
        url,
        success: false,
      };
    }
  }
  
  //combine youTube embed and link preview rendering logic into a single function
  function renderContentWithPreviews(content, previewData) {
    if (!content) return null;
    
    const youtubeUrl = extractURLFromContent(content);
    const youtubeID = youtubeUrl ? extractYouTubeID(youtubeUrl) : null;
    
    //check for youtube link first, if it's a youtube link, skip using regular link preview and preview youtube
    if (youtubeID) {
      //replace the youtube URL with an iframe
      const embedUrl = `https://www.youtube.com/embed/${youtubeID}`;
      const parts = content.split(youtubeUrl);
      
      //render YouTube video if URL is a youtube link
      return (
        <>
          {parts[0]}
          <div className="youtube-embed">
            <iframe 
              width="100%" 
              height="315" 
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          {parts[1]}
        </>
      );
    } else if (previewData && previewData.success) {
      //replace the URL with a link preview
      const url = previewData.url;
      const parts = content.split(url);
      
      return (
        <>
          {parts[0]}
          {/*render the URL as an <a> element for non-youtube links */}
          <a href={url} target="_blank" rel="noopener noreferrer" className="postUrl">
            <div className="link-preview-container">
            {/* display the image from the preview data */}
              {previewData.image && (
                <img src={previewData.image} alt={previewData.title} className="link-preview-image" />
              )}
              <div className="link-preview-details">
                <div className="link-preview-title">{previewData.title}</div>
                <div className="link-preview-description">{previewData.description}</div>
                <div className="link-preview-url">{url}</div>
              </div>
            </div>
          </a>
          {parts[1]}
        </>
      );
    }
    
    //if no embeds, return the content as is
    return content;
  }
  
  export {
    extractYouTubeID,
    extractURLFromContent,
    fetchLinkPreview,
    renderContentWithPreviews
  };