/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from "react";
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import SubmitPostForm from './SubmitPostForm.jsx';
import CommentForm from './CommentForm.jsx';
import {  Typography,  IconButton } from '@mui/material';
import {  ChatBubbleOutline } from '@mui/icons-material';
import { UserContext } from '../App.jsx';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function CommentModal({post}) {
  
    //modal states
    const [open, setOpen] = useState(false);
    const handleOpen = (e) => {e.preventDefault(); setOpen(true)};
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
            onClick={(e) => e.preventDefault()} //prevent routing to the post, which is the parent element within the PostDisplay.jsx
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
            backdrop: {
                timeout: 500,
            },
            }}
        >
                <Fade in={open}>
                    <Box sx={style}>

                    <CommentForm
                    post={post} 
                    />

                    </Box>
                </Fade>
            </Modal>
        </>
    );
}