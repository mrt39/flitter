/* eslint-disable react/prop-types */
import { useState, useContext } from "react";
import { AppStatesContext } from '../App.jsx';
import PostDisplay from '../components/PostDisplay.jsx';
import CommentForm from './CommentForm.jsx';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import CloseIcon from '@mui/icons-material/Close';
import { Typography, IconButton} from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';

import "../styles/CommentModal.css"


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  pt: 6,
  borderRadius: '16px',
};

export default function CommentModal({ post }) {


  const {darkModeOn} = useContext(AppStatesContext);

  // modal states
  const [open, setOpen] = useState(false);
  const handleOpen = (e) => {
    e.preventDefault();
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton onClick={handleOpen} size="small" className="icon-button comment-button">
        <ChatBubbleOutline fontSize="small" />
        <Typography component="span" variant="body2" className="postLikeCommentCount">
          {post.commentCount}
        </Typography>
      </IconButton>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClick={(e) => e.preventDefault()}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            style: { backgroundColor: 'rgba(50, 50, 50, 0.5)' } // change the background color of the backdrop
          },
        }}
      >
        <Fade in={open}>
            <Box 
            sx={style}
            className={`comment-modal ${darkModeOn ? 'dark-mode' : ''}`}
            >
                <IconButton
                  aria-label="close"
                  onClick={handleClose}
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 23,
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <PostDisplay 
                post={post} 
                location={"comment-modal"}
                />
                
                <Box className="commentModalReplyingToTextContainer" >
                        <Typography className="commentModalReplyingText" variant="body2" color="textSecondary">
                        Commenting to <Typography component="span" sx={{ color: '#1da1f2', fontSize: "13px" }}>@{post.from[0].name}</Typography>
                        </Typography>
                </Box> 

                <CommentForm post={post} handleClose={handleClose} />
          </Box>
        </Fade>
      </Modal>
    </>
  );
}