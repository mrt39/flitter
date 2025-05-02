/* eslint-disable react/prop-types */
import PostDisplay from './PostDisplay.jsx';
import CommentForm from './CommentForm.jsx';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import CloseIcon from '@mui/icons-material/Close';
import { Typography, IconButton } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';
import { useUI } from '../contexts/UIContext.jsx';
import { useModal } from '../utilities/modalUtils.js';
import "../styles/CommentModal.css";

import "../styles/CommentModal.css"


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "80%", //responsive width
  maxWidth: "500px",
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  pt: 6,
  borderRadius: '16px',
};

export default function CommentModal({ post }) {


  const { darkModeOn } = useUI();
  const { isOpen, openModal, closeModal } = useModal(false);

  
  const handleOpen = (e) => {
    e.stopPropagation();
    e.preventDefault();
    openModal();
  };
  const handleClose = () => closeModal();

  return (
    <>
      <IconButton onClick={handleOpen} size="small" className="icon-button comment-button">
        <ChatBubbleOutline fontSize="small" sx={{ color: darkModeOn ? 'rgb(113, 118, 123)' : 'rgb(83, 100, 113)' }} />
        <Typography component="span" variant="body2" className={`postLikeCommentCount ${darkModeOn ? 'dark-mode' : ''}`}>
          {post.commentCount}
        </Typography>
      </IconButton>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isOpen}
        onClick={(e) => {e.preventDefault(); e.stopPropagation()}} //prevent the modal from opening the post link when clicked on anywhere within the modal
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
        <Fade in={isOpen}>
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
                Commenting to <Typography component="span" sx={{ color: '#1da1f2', fontSize: "13px" }}>@{post.from.name}</Typography>
                </Typography>
              </Box> 
              <CommentForm post={post} handleClose={handleClose} />
          </Box>
        </Fade>
      </Modal>
    </>
  );
}