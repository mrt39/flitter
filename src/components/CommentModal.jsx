/* eslint-disable react/prop-types */
import { useState } from "react";
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
  //track if a comment is being submitted
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  function handleOpen(e) {
    e.stopPropagation();
    e.preventDefault();
    openModal();
  }
  
  function handleClose() {
    //only close if not submitting
    if (!isSubmitting) {
      closeModal();
    }
  }
  
  //handle comment submission completion
  function handleSubmissionComplete() {
    setIsSubmitting(false);
    closeModal();
  }

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
            className={`comment-modal ${darkModeOn ? 'dark-mode' : ''} ${isSubmitting ? 'submitting' : ''}`}
            >
              <IconButton
                aria-label="close"
                onClick={handleClose}
                disabled={isSubmitting}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 23,
                  zIndex: 12, // higher than overlay
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
              <CommentForm 
                post={post} 
                handleClose={handleSubmissionComplete} 
                onSubmitStart={() => setIsSubmitting(true)}
              />
          </Box>
        </Fade>
      </Modal>
    </>
  );
}