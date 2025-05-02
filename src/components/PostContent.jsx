//component for displaying post content, including text, media, and actions

/* eslint-disable react/prop-types */
import { Typography, IconButton, ListItemText, ListItemAvatar, Box } from '@mui/material';
import { FavoriteBorder, Favorite } from '@mui/icons-material';
import dayjs from 'dayjs';
import Tooltip from '@mui/material/Tooltip';
import UserAvatar from './UserAvatar.jsx';
import MediaEmbed from './MediaEmbed.jsx';
import HoverUserCard from './HoverUserCard.jsx';
import CommentModal from './CommentModal.jsx';
import { useUI } from '../contexts/UIContext.jsx';

function PostContent({ 
  post, 
  location, 
  currentUserLikedPost,
  optimisticLikeCount,
  tempLiked,
  likeButtonDisabled,
  handleLike,
  handleProfileRouting
}) {
  const { darkModeOn } = useUI();

  return (
    <span className={`postContentContainer ${darkModeOn ? 'dark-mode' : ''}`}>
      <span className="usernameLinkOnPost avatarLink" onClick={(e) => { 
        e.preventDefault();
        e.stopPropagation(); 
        handleProfileRouting(post.from);
      }}>
        <ListItemAvatar>
          <UserAvatar
            user={post.from}
            source="post"
          />
        </ListItemAvatar>
      </span>
      <ListItemText
        primary={(
          <div className="post-header">
            <Tooltip 
              title={
                <Box sx={{ minWidth: 280 }}> 
                  <HoverUserCard 
                    user={post.from} 
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
                  e.stopPropagation(); 
                  handleProfileRouting(post.from);
                }}
              >
                <Typography variant="subtitle1" className="post-name">
                  {/* tap into post in different ways based on its an array or not */}
                  {post.from.name} 
                </Typography>
              </span>
            </Tooltip>
            <Typography variant="body2" color="textSecondary" className={`post-date ${darkModeOn ? 'dark-mode' : ''}`}>
              {dayjs(new Date(post.date)).format('MMM D, H:mm')}
            </Typography>
          </div>
        )}
        secondary={(
          <span>
            <Typography 
              component="span" 
              variant="body1" 
              className={`post-content ${darkModeOn ? 'dark-mode' : ''}${post.image ? ' center-image' : ''}`}
            >
              {post.image ? (
                <img className="postImg" src={post.image} alt="image" />
              ) : (
                <MediaEmbed content={post.message} />
              )}
            </Typography>
            {location && location === "comment-modal" ? "" : (
              <span className="post-actions">
                <CommentModal post={post} />
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation(); //prevent the click event from opening the link to the post
                    e.preventDefault();
                    handleLike();
                  }}
                  size="small"
                  //as "tempLiked" becomes false in 0.3 seconds, liked class will be removed from the button, 
                  //thus preventing multiple posts from playing the animation at the same time 
                  className={`icon-button like-button ${currentUserLikedPost && tempLiked ? 'liked' : ''}`}
                  disabled={likeButtonDisabled}
                >
                  {currentUserLikedPost ? //find if post is already liked by the user
                    (
                      <Favorite fontSize="small" 
                        sx={{ 
                          color: 'rgb(249, 24, 128)', 
                        }} 
                      />
                    ) : (
                      <FavoriteBorder 
                        fontSize="small" 
                        sx={{ 
                          color: darkModeOn ? 'rgb(113, 118, 123)' : 'rgb(83, 100, 113)' 
                        }} 
                      />
                    )
                  }
                  <Typography 
                    component="div" 
                    variant="body2" 
                    className={`postLikeCommentCount ${darkModeOn ? 'dark-mode' : ''}`}
                  >
                    {optimisticLikeCount}
                  </Typography>
                </IconButton>
              </span>
            )}
          </span>
        )}
      />
    </span>
  );
}

export default PostContent;