/* eslint-disable react/prop-types */
import {useState} from "react";
import dayjs from 'dayjs';
import HoverUserCard from './HoverUserCard.jsx';
import Tooltip from '@mui/material/Tooltip';
import UserAvatar from './UserAvatar.jsx';
import LinkWrapper from './LinkWrapper.jsx';
import { createProfileRoute } from '../utilities/routingUtils.js';
import { ListItemText,  ListItemAvatar, Box, Typography} from '@mui/material';
import { useUI } from '../contexts/UIContext.jsx';
import { useUser } from '../contexts/UserContext.jsx';

import '../styles/CommentDisplay.css'


const CommentDisplay = ({comment}) => {

    //use context hooks
    const { darkModeOn } = useUI();
    const { handleProfileRouting } = useUser();

    const [tooltipOpen, setTooltipOpen] = useState(false);


    const handleTooltipOpen = () => {
        setTooltipOpen(true);
    };

    const handleTooltipClose = () => {
        setTooltipOpen(false);
    };

    return (
      <>
        <LinkWrapper
          to={createProfileRoute(comment.from)}
          onClick={() => handleProfileRouting(comment.from)}
          className="usernameLinkOnComment" 
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          <ListItemAvatar>
          <UserAvatar
                  user={comment.from}
                  source="post"
          />
          </ListItemAvatar>
        </LinkWrapper>
        <ListItemText
            primary={
            <div className="comment-header">
              {/* MUI tooltip that will display a user card on hover */}
              <Tooltip 
                title={
                    <Box sx={{ minWidth: 280 }}> 
                        <HoverUserCard 
                          user={comment.from} 
                          handleTooltipClose={handleTooltipClose}
                        />
                    </Box>
                }
                enterDelay={200}
                leaveDelay={200}
                placement="bottom"
                open={tooltipOpen} // control the tooltip open state
                onOpen={handleTooltipOpen}
                onClose={handleTooltipClose}
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
                  <LinkWrapper
                    to={createProfileRoute(comment.from)}
                    onClick={() => handleProfileRouting(comment.from)}
                    className="usernameLinkOnComment"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    <Typography variant="subtitle1" className="comment-name">
                    {comment.from.name}
                    </Typography>
                  </LinkWrapper>

              </Tooltip>

              <Typography variant="body2" color="textSecondary" className={`comment-date ${darkModeOn ? 'dark-mode' : ''}`}>
              {dayjs(new Date(comment.date)).format('MMM D, H:mm')}
              </Typography>
            </div>
            }
            secondary={
                <>
                    <Typography component="span" variant="body1" className={`comment-content ${darkModeOn ? 'dark-mode' : ''}`}>
                        {comment.comment}
                    </Typography>
                </>
            }
        />

      </>
    );
  };
  
  export default CommentDisplay;