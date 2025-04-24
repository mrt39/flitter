/* eslint-disable react/prop-types */
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import SubmitPostForm from './SubmitPostForm.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import { useModal } from '../utilities/modalUtils.js';
import "../styles/SubmitPostModal.css";

export default function SubmitPostModal() {
  const { darkModeOn } = useUI();
  const { isOpen, openModal, closeModal } = useModal(false);

  return (
    <div>
      <Button 
        sx={{                        
          fontWeight: 'bold',
          fontSize: '17px'
        }} 
        id="sidebarPostBtn" 
        onClick={openModal}
      >
        Post
      </Button>
      <IconButton
        className='leftSideBar-postIcon'
        sx={{
          color: 'rgb(29, 155, 240)',
          padding: '20px',
        }}
        onClick={openModal}
      >
        <CreateOutlinedIcon sx={{ fontSize: 30 }} />
      </IconButton>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isOpen}
        onClose={closeModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            style: { backgroundColor: 'rgba(50, 50, 50, 0.5)' } // change the background color of the backdrop
          },
        }}
      >
        <Fade in={isOpen}>
          <Box         
            className={`submitPost-modal ${darkModeOn ? 'dark-mode' : ''}`}
          >
          <IconButton
              aria-label="close"
              onClick={closeModal}
              sx={{
                position: 'absolute',
                top: 8,
                right: 23,
              }}
            >
              <CloseIcon />
            </IconButton>
          <SubmitPostForm
            location="navbar"
            handleClose={closeModal}
          />
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}