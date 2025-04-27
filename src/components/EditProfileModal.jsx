/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { 
  Modal, Box, Typography, IconButton, 
  Card, CardContent, Backdrop, CircularProgress 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import { updateUserProfile, uploadProfileImage } from '../utilities/userService.js';
import ProfileImageUpload from './EditProfileImageUpload.jsx';
import ProfileForm from './EditProfileForm.jsx';
import '../styles/EditProfileModal.css';

function EditProfileModal({ open, handleClose }) {
  const { darkModeOn, setSnackbarOpenCondition, setSnackbarOpen } = useUI();
  const { currentUser, setProfileUpdated } = useAuth();

  const [imgSubmitted, setImgSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clickedOnProfileUpdate, setClickedOnProfileUpdate] = useState(false);
  const [uploadedImg, setUploadedImg] = useState(null);
  const [profileData, setProfileData] = useState({});

  //handle uploading image
  useEffect(() => {
    async function changeProfileImage() {
      try {
        const formData = new FormData();
        formData.append("image", uploadedImg);
        
        await uploadProfileImage(currentUser._id, formData);
        console.log("Image updated successfully!");
        
        //update the profile updated state so that authcontext fetches the updated user data
        setProfileUpdated(prev => !prev);
        
        //show the success snackbar
        setSnackbarOpenCondition("profileChangeSuccess");
        setSnackbarOpen(true);
        
        //close the modal
        handleClose();
      } catch (error) {
        console.error('Error:', error);
        //show the error snackbar
        setSnackbarOpenCondition("failure");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
        setImgSubmitted(false);
      }
    }
    
    //only trigger when image is sent
    if (imgSubmitted === true) {
      changeProfileImage();
    }
  }, [imgSubmitted]);

  //submit the profile changes
  useEffect(() => {
    async function changeUserDetails() {
      try {
        await updateUserProfile(currentUser._id, profileData);
        console.log("Profile updated successfully!");
        
        //update the profile updated state so that authcontext fetches the updated user data
        setProfileUpdated(prev => !prev);
        
        //show the success snackbar
        setSnackbarOpenCondition("profileChangeSuccess");
        setSnackbarOpen(true);
        
        //close the modal
        handleClose();
      } catch (error) {
        console.error('Error:', error);
        
        //show the error snackbar
        setSnackbarOpenCondition("failure");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
        setClickedOnProfileUpdate(false);
      }
    }
    
    //only trigger when profile update is clicked
    if (clickedOnProfileUpdate) {
      changeUserDetails();
    }
  }, [clickedOnProfileUpdate]);

  function handleImageSubmit(image) {
    setUploadedImg(image);
    setImgSubmitted(true);
    setLoading(true);
  }

  function handleProfileSubmit(values) {
    setProfileData(values);
    setClickedOnProfileUpdate(true);
    setLoading(true);
  }

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      slotProps={{
        backdrop: {
          style: { backgroundColor: 'rgba(50, 50, 50, 0.5)' }
        }
      }}
    >
      <Box className={`modalBox ${darkModeOn ? 'dark-mode' : ''}`}>
        <Box className="modalHeader">
          <Typography variant="h6" fontWeight="bold" sx={{ ml: "22px" }}>
            Edit Profile
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Card className="profileCard">
          <CardContent className="profileCard-content">
            <ProfileImageUpload 
              currentUser={currentUser}
              onSubmit={handleImageSubmit}
              loading={loading}
            />
            
            <ProfileForm
              currentUser={currentUser}
              onSubmit={handleProfileSubmit}
              loading={loading}
            />
          </CardContent>
        </Card>
        
        <Backdrop open={loading} className="backdrop">
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Modal>
  );
}

export default EditProfileModal;