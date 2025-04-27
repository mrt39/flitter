//component for displaying embedded media (youtube videos, link previews) in posts

/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { extractURLFromContent, extractYouTubeID, fetchLinkPreview } from '../utilities/mediaUtils.jsx';
import '../styles/PostDisplay.css';

function MediaEmbed({ content }) {
  //state to store link preview data
  const [linkPreviewData, setLinkPreviewData] = useState(null);

  //useEffect to fetch link previews
  useEffect(() => {
    async function getLinkPreview() {
      if (!content) return;
      
      //extract the first URL from the content
      const url = extractURLFromContent(content);
      if (url) {
        //fetch metadata for the URL
        const data = await fetchLinkPreview(url);
        setLinkPreviewData(data);
      }
    }
    
    getLinkPreview();
  }, [content]);

  if (!content) return null;

  //extract the first URL from the content
  const url = extractURLFromContent(content);
  if (!url) return <>{content}</>;
  
  //check if the URL is a YouTube video
  const youtubeID = extractYouTubeID(url);
  
  if (youtubeID) {
    //render YouTube video if URL is a youtube link
    const embedUrl = `https://www.youtube.com/embed/${youtubeID}`;
    const parts = content.split(url);
    
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
  } else if (linkPreviewData && linkPreviewData.success) {
    //render the URL as an <a> element for non-youtube links
    const parts = content.split(url);
    
    return (
      <>
        {parts[0]}
        <a href={url} target="_blank" rel="noopener noreferrer" className="postUrl">
          <div className="link-preview-container">
            {/* display the image from the preview data */}
            {linkPreviewData.image && (
              <img src={linkPreviewData.image} alt={linkPreviewData.title} className="link-preview-image" />
            )}
            <div className="link-preview-details">
              <div className="link-preview-title">{linkPreviewData.title}</div>
              <div className="link-preview-description">{linkPreviewData.description}</div>
              <div className="link-preview-url">{linkPreviewData.url}</div>
            </div>
          </div>
        </a>
        {parts[1]}
      </>
    );
  }
  
  //if no embeds, return the content as is
  return <>{content}</>;
}

export default MediaEmbed;