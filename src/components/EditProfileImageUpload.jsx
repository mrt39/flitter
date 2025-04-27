//component for profile image upload, used in EditProfileModal

/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Box, Button} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import UserAvatar from './UserAvatar.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import '../styles/EditProfileModal.css';

function ProfileImageUpload({ 
  currentUser, 
  onSubmit,
  loading = false 
}) {
  const { darkModeOn, setSnackbarOpenCondition, setSnackbarOpen } = useUI();
  const [uploadedImg, setUploadedImg] = useState(null);
  const [showSaveImageButton, setShowSaveImageButton] = useState(false);
  
  function handleImageChange(event) {
    const uploadedImg = event.target.files[0];
    if (!uploadedImg) return;
    
    //check the filetype to ensure it's an image. throw error if it isn't
    if (uploadedImg.type !== "image/x-png" && uploadedImg.type !== "image/png" && uploadedImg.type !== "image/jpeg") {
      console.error("Only image files can be attached!");
      setSnackbarOpenCondition("notAnImage");
      setSnackbarOpen(true);
      return;
    //if image size is > 1mb, throw error
    } else if (uploadedImg.size > 1048576) {
      console.error("Image size is too big!");
      setSnackbarOpenCondition("sizeTooBig");
      setSnackbarOpen(true);
      return;
    } else {
      setUploadedImg(uploadedImg);
      setShowSaveImageButton(true);
    }
  }
  
  function submitImg() {
    if (uploadedImg) {
      onSubmit(uploadedImg);
    }
  }
  
  return (
    <div className='editprofile-avatar-and-saveimagebtn-container'>
      <Box className="profileImageBox">
        <UserAvatar 
          user={currentUser} 
          source={"editProfileModal"} 
        />
        <input
          type="file"
          className="hidden"
          id="image"
          name="image"
          accept="image/*"
          disabled={loading || currentUser.email === "demoacc@demoacc.com"}
          onChange={handleImageChange}
        />
        <label htmlFor="image" className="cameraIconLabel">
          <CameraAltIcon className="cameraIcon" />
        </label>
      </Box>
      {showSaveImageButton && (
        <Button
          variant="outlined"
          size="small"
          onClick={submitImg}
          disabled={loading}
          className="saveImageButton"
          sx={{
            borderRadius: '9999px', 
            textTransform: 'none',
            padding: '6px 16px',
            borderColor: (darkModeOn ? 'white' : 'gray'),
            backgroundColor: (darkModeOn ? 'rgb(239, 243, 244)' : 'rgb(15, 20, 25);'),
            color: (darkModeOn ? 'black' : 'white'),
            '&:hover': {
              backgroundColor:(darkModeOn ? 'rgb(215, 219, 220)' : 'rgb(39, 44, 48);'),
              borderColor: (darkModeOn ? 'white' : 'gray'),
              color:(darkModeOn ? 'black' : 'white'),
            },
          }}
        >
          Save Image
        </Button>
      )}
    </div>
  );
}

export default ProfileImageUpload;