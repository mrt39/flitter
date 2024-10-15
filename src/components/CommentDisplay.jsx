/* eslint-disable react/prop-types */
import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import HoverUserCard from './HoverUserCard.jsx';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import UserAvatar from './UserAvatar.jsx';
import {AppStatesContext} from '../App.jsx';
import { Avatar } from '@mui/material';
import { ListItemText,  ListItemAvatar, Box} from '@mui/material';
import {  Typography,  IconButton,  } from '@mui/material';
import { FavoriteBorder} from '@mui/icons-material';


import '../styles/CommentDisplay.css'


const CommentDisplay = ({comment}) => {

    //Pass the UserContext defined in app.jsx

    const {darkModeOn, handleProfileRouting} = useContext(AppStatesContext); 

    const [tooltipOpen, setTooltipOpen] = useState(false);


    const handleTooltipOpen = () => {
        setTooltipOpen(true);
    };

    const handleTooltipClose = () => {
        setTooltipOpen(false);
    };

    return (
      <>
        <span 
          className="usernameLinkOnComment" 
          onClick={(e) => 
          { 
          e.preventDefault();
          handleProfileRouting(comment.from[0] //route to profile
          )}}
        >
          <ListItemAvatar>
          <UserAvatar
                  user={comment.from[0]}
                  source="post"
          />
          </ListItemAvatar>
        </span>
        <ListItemText
            primary={
            <div className="comment-header">
              {/* MUI tooltip that will display a user card on hover */}
              <Tooltip 
                title={
                    <Box sx={{ minWidth: 280 }}> 
                        <HoverUserCard 
                          user={comment.from[0]} 
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
                  <span 
                      className="usernameLinkOnComment" 
                      onClick={(e) => 
                            { 
                            e.preventDefault();
                            handleProfileRouting(comment.from[0] //route to profile
                            )}}
                  >
                    <Typography variant="subtitle1" className="comment-name">
                    {comment.from[0].name}
                    </Typography>
                  </span>

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