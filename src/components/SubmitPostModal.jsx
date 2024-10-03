/* eslint-disable react/prop-types */
import { useState} from 'react'
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import SubmitPostForm from './SubmitPostForm.jsx';



const style = {
  position: 'absolute',
  top: '50%',
  left: '49.52%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  height: 200,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  borderRadius: "16px"
};

export default function SubmitPostModal() {



    //modal states
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

  


  return (
    <div>
      <Button id="sidebarPostBtn" onClick={handleOpen}>Post</Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
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