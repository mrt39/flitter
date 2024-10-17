/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import CommentModal from './CommentModal.jsx';
import HoverUserCard from './HoverUserCard.jsx';
import UserAvatar from './UserAvatar.jsx';
import { UserContext, AppStatesContext} from '../App.jsx';
import { Avatar } from '@mui/material';
import { ListItemText,  ListItemAvatar, Box} from '@mui/material';
import {  Typography,  IconButton,  } from '@mui/material';
import { Favorite, FavoriteBorder} from '@mui/icons-material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
// Import the link-preview-js library at the top of the file
import { getLinkPreview } from 'link-preview-js';

//imports for generating the url path for routing 
import slugify from 'slugify';
import '../styles/PostDisplay.css'


const PostDisplay = ({post, location}) => {

    //Pass the UserContext defined in app.jsx
    const { currentUser, setSelectedUser } = useContext(UserContext); 

    const {refreshPosts, setRefreshPosts, darkModeOn, handleProfileRouting} = useContext(AppStatesContext); 

    //state for storing if the currentuser has already liked this post
    const [currentUserLikedPost, setCurrentUserLikedPost] = useState(false); // Like state for individual post

    //Id for liking the posts
    const [pressedLikePost, setPressedLikePost] = useState(false); // Like state for individual post

    // Temporary state for like animation (in order to remove the "liked" class after 0.3 seconds, to prevent the animation from playing when the user likes another post)
    const [tempLiked, setTempLiked] = useState(false); // Temporary state for like animation

      
    function handleLike(){
        setTempLiked(true);
        setTimeout(() => setTempLiked(false), 300); //remove the liked class after 0.3 seconds
        setPressedLikePost(true)
    }

    //useffect for liking posts
    useEffect(() => {
        async function likePost() {
        //find if post is already liked by the user, if user is already in likedby array, in order to properly display (filled or empty+like animation) the heart icon in ui
        //find via converting id objects to string because querying with id's doesn't work
        const likedPostIndex = post.likedby.findIndex(u => u._id.toString() === currentUser._id.toString());

        await fetch(import.meta.env.VITE_BACKEND_URL+'/likePost', {
            method: "PATCH",
            // storing date as isostring to make the reading easier later
            body: JSON.stringify({ postID: post._id, likedBy: currentUser}), 
            headers: {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
            },
            credentials:"include" //required for sending the cookie data-authorization check
        })
        .then(async result => {
            if (result.ok){
            await result.json();
            setCurrentUserLikedPost(likedPostIndex === -1); //update state based on whether the user has liked this post or not
            console.log("Liked Post!")
            setPressedLikePost(false)
            setRefreshPosts(!refreshPosts)
            } else{
            throw new Error(result)
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setPressedLikePost(false)
        }); 
        }
        //only trigger when comment is posted
        if (pressedLikePost){
        likePost();
        } 
    }, [pressedLikePost]);


/* ---------------------------------- EMBED YOUTUBE VIDEO AND LINK PREVIEW LOGIC ---------------------------------- */
//extract YouTube video ID from URL
const extractYouTubeID = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    //match the regex with the url
    const match = url.match(regex);
    return match ? match[1] : null;
};

//state to store link preview data
const [linkPreviewData, setLinkPreviewData] = useState(null);


//function to fetch link preview data
const fetchLinkPreview = async (url) => {
    try {
        //using the link-preview-js library (getLinkPreview function) to fetch the link preview data
        const data = await getLinkPreview(url);
        return data;
    } catch (error) {
        console.error('Error fetching link preview:', error);
        return null;
    }
};

//function to extract the first URL from the post content
const extractURLFromContent = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex);
    return urls ? urls[0] : null; // return the first URL found
};

//useEffect to fetch link previews
useEffect(() => {
    const fetchPreview = async () => {
        const url = extractURLFromContent(post.message); //extract URL from post content
        if (url) {
            const previewData = await fetchLinkPreview(url);
            setLinkPreviewData(previewData); //store the preview data in state
        }
    };
    fetchPreview();
}, [post.message]); //trigger the effect when the post message changes

// combine youTube embed and link preview rendering logic into a single function
const renderContentWithPreviews = (content, previewData) => {
    //regular expression to detect URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    //split the content by URLs
    const parts = content.split(urlRegex);

    return (
        <>
            {parts.map((part, index) => {
                //check if the part is a URL
                if (urlRegex.test(part)) {
                    const videoID = extractYouTubeID(part);
                    if (videoID) {
                        //render YouTube video if URL is a youtube link
                        return (
                            <div key={index} className="youtube-video-container">
                                <iframe
                                    width="500"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${videoID}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Embedded YouTube Video"
                                ></iframe>
                            </div>
                        );
                    } else {
                        //render the URL as an <a> element for non-youtube links
                        return (
                            <a key={index} href={part} target="_blank" rel="noopener noreferrer">
                                {part}
                            </a>
                        );
                    }
                }
                //render the rest of the message as plain text
                return <span key={index}>{part} </span>;
            })}
            {/* render the link preview if available and not a youtube link */}
            {previewData && !extractYouTubeID(previewData.url) && (
                <div className="link-preview-container">
                    {/* display the first image from the preview data */}
                    {previewData.images && previewData.images.length > 0 && (
                        <img src={previewData.images[0]} alt="Link preview" className="link-preview-image" />
                    )}
                    <div className="link-preview-details">
                        <Typography variant="subtitle1" className="link-preview-title">
                            {previewData.title}
                        </Typography>
                        <Typography variant="body2" className="link-preview-description">
                            {previewData.description}
                        </Typography>
                        <Typography variant="body2" className="link-preview-url">
                            {previewData.url}
                        </Typography>
                    </div>
                </div>
            )}
        </>
    );
};




  
//define the main post component here, in order to not to repeat the code in the "location === "singular-post-page" ?" statement below
  const PostContent = ({ post, handleProfileRouting, handleLike }) => (
    <span className={`postContentContainer ${darkModeOn ? 'dark-mode' : ''}`}>
        <span className="usernameLinkOnPost avatarLink" onClick={(e) => {
            e.preventDefault();
            handleProfileRouting(post.from[0]);
        }}>
            <ListItemAvatar>
                <UserAvatar
                    user={post.from[0]}
                    source="post"
                />
            </ListItemAvatar>
        </span>
        <ListItemText
            primary={(
                <div className="post-header">
                    {/* MUI tooltip that will display a user card on hover */}
                    <Tooltip 
                        title={
                            <Box sx={{ minWidth: 280 }}> 
                                <HoverUserCard 
                                user={post.from[0]} 
                                />
                                
                            </Box>
                        }
                        enterDelay={200}
                        leaveDelay={200}
                        placement="bottom"
                        PopperProps={{
                            modifiers: [
                                {
                                    name: 'arrow',
                                    enabled: false, 
                                },
                            ],
                            sx: {
                              '.MuiTooltip-tooltip': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none', 
                                padding: 0,
                              },
                            },
                          }}        
                    > 
                        <span
                            className="usernameLinkOnPost"
                            onClick={(e) => {
                                e.preventDefault();
                                handleProfileRouting(post.from[0]);
                            }}
                        >
                            <Typography variant="subtitle1" className="post-name">
                                {post.from[0].name}
                            </Typography>

                        </span>
                    </Tooltip>
                    <Typography variant="body2" color="textSecondary" className={`post-date ${darkModeOn ? 'dark-mode' : ''}`}>
                        {dayjs(new Date(post.date)).format('MMM D, H:mm')}
                    </Typography>
                </div>
            )}
            secondary={(
                <>
                    <Typography component="span" variant="body1" className={`post-content ${darkModeOn ? 'dark-mode' : ''}`}
                    >
                        {post.image ? (
                            <img className="postImg" src={post.image} alt="image" />
                        ) : (
                            <>
                                {renderContentWithPreviews(post.message, linkPreviewData)} {/* // render the link preview and youtube URL if available */}
                            </>

                        )}
                    </Typography>
                    {location && location === "comment-modal" ? "" : (
                        <span className="post-actions">
                            <CommentModal post={post} />
                            <IconButton
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLike();
                                }}
                                size="small"
                                 //as "tempLiked" becomes false in 0.3 seconds, liked class will be removed from the button, thus preventing multiple posts from playing the animation at the same time 
                                className={`icon-button like-button ${currentUserLikedPost && tempLiked ? 'liked' : ''}`}

                            >

                                {post.likedby.findIndex(u=>u._id.toString()===currentUser._id.toString())>-1 ?  //find if post is already liked by the user, if user is already in likedby array
                                (
                                <Favorite fontSize="small" 
                                sx={{ 
                                    color: 'rgb(249, 24, 128)', 
                                }} />
                                ) : ( //if it isn't liked, display an empty heart icon
                                <FavoriteBorder fontSize="small" sx={{ color: darkModeOn ? 'rgb(113, 118, 123)' : 'rgb(83, 100, 113)' }} />
                                )}

                                <Typography component="span" variant="body2" className={`postLikeCommentCount ${darkModeOn ? 'dark-mode' : ''}`}>
                                    {post.likeCount}
                                </Typography>
                            </IconButton>
                        </span>
                    )}
                </>
            )}
        />
    </span>
);

return (
    <span className="postDisplayContainer">
        {location === "singular-post-page" ? (
            <PostContent post={post} handleProfileRouting={handleProfileRouting} handleLike={handleLike} />
        ) : (
            <Link className={`singularPostLinkOnPost ${darkModeOn ? 'dark-mode' : ''}`} to={`/post/${post._id}`}>
                <PostContent post={post} handleProfileRouting={handleProfileRouting} handleLike={handleLike} />
            </Link>
        )}
    </span>
);
};

export default PostDisplay;


