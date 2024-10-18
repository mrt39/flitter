/* eslint-disable react/prop-types */
import { useState, useContext} from 'react'
import { AppStatesContext } from '../App.jsx';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SubmitPostForm from './SubmitPostForm.jsx';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';

import "../styles/SubmitPostModal.css"


export default function SubmitPostModal() {


  const {darkModeOn} = useContext(AppStatesContext);

  //modal states
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  return (
    <div>
      <Button 
        sx={{                        
          fontWeight: 'bold',
          fontSize: '17px'
        }} 
        id="sidebarPostBtn" 
        onClick={handleOpen}
      >
        Post
      </Button>
      <IconButton
        className='leftSideBar-postIcon'
        sx={{
          color: 'rgb(29, 155, 240)',
          padding: '20px',
        }}
        onClick={handleOpen}
      >
        <CreateOutlinedIcon sx={{ fontSize: 30 }} />
      </IconButton>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            style: { backgroundColor: 'rgba(50, 50, 50, 0.5)' } // change the background color of the backdrop
          },
        }}
      >
        <Fade in={open}>
          <Box         
            className={`submitPost-modal ${darkModeOn ? 'dark-mode' : ''}`}
          >
          <IconButton
              aria-label="close"
              onClick={handleClose}
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
          handleClose={handleClose}

          />

          </Box>
        </Fade>
      </Modal>
    </div>
  );
}