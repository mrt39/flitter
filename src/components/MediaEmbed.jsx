//component for displaying embedded media (youtube videos, link previews) in posts

/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { extractURLFromContent, extractYouTubeID, fetchLinkPreview } from '../utilities/mediaUtils.jsx';
import '../styles/PostDisplay.css';

function MediaEmbed({ content }) {
  //state to store link preview data
  const [linkPreviewData, setLinkPreviewData] = useState(null);
  //ref to track if a request for the same link has already been made
  const requestMadeRef = useRef(false);


  //useEffect to fetch link previews
  useEffect(() => {    
    async function getLinkPreview() {
      if (!content) return;

      //extract the first URL from the content
      const url = extractURLFromContent(content);
    
      if (url) {
        //prevent duplicate requests for the same content
        if (requestMadeRef.current) {
          return;
        }
        
        requestMadeRef.current = true;
        
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
    const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeID}`;
    const parts = content.split(url);
    
    return (
      <>
        {parts[0]}
        <span className="youtube-embed-container">
          <iframe 
            width="100%" 
            height="315" 
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </span>
        {parts[1]}
      </>
    );
  } else if (linkPreviewData && linkPreviewData.success) {
    
    //for non-youtube links, preserve the original text order but make the URL clickable
    const parts = content.split(url);
    
    return (
      <>
        {/* keep original text order: plain text before URL, render url as <a>, plain text after URL */}
        {parts[0]}
        <a className="postUrl" href={url} target="_blank" rel="noopener noreferrer">
            {url}
        </a>
        {parts[1]}
        
        {/* display preview container below the entire text content */}
        <span className="link-preview-container">
          {/* display the image from the preview data */}
          {linkPreviewData.images && linkPreviewData.images.length > 0 && (
            <img src={linkPreviewData.images[0]} alt={linkPreviewData.title} className="link-preview-image" />
          )}
          <span className="link-preview-details">
            <a href={url} target="_blank" rel="noopener noreferrer" className="link-preview-link">
              <span className="link-preview-title">{linkPreviewData.title}</span>
            </a>
            <span className="link-preview-description">
              {/* limit the description's displayed character count to 250 */}
            {linkPreviewData.description?.length > 250 
              ? `${linkPreviewData.description.substring(0, 250)}...` 
              : linkPreviewData.description
            }
            </span>
          </span>
        </span>
      </>
    );
  }
  
  //if no embeds, return the content as is
  return <>{content}</>;
}

export default MediaEmbed;