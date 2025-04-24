/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { IconButton, Box } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useUI } from '../contexts/UIContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePost } from '../contexts/PostContext.jsx';
import { submitImagePost } from '../utilities/postService.js';

export default function ImageUploadButton({ 
  location, 
  handleClose, 
  setError, 
  fileInputRef, 
  setSelectedImage, 
  imageSelected, 
  setImageSelected 
}) {
  const { 
    setImgSubmittedNavbar, 
    setImgSubmittedHomePage, 
    isSubmittingPost, 
    imgSubmittedNavbar, 
    imgSubmittedHomePage, 
    setisSubmittingPost 
  } = usePost();
  const { setSnackbarOpenCondition, setSnackbarOpen } = useUI();
  const { currentUser } = useAuth();

  const [imageFile, setImageFile] = useState(null);

  //when the attachment icon is clicked, click on the hidden input (type=file) element
  function handleAttachmentClick() {
    fileInputRef.current.click(); // trigger file input
  }

  //when user selects an image and changes the value of the input, change the state 
  function handleFileInputChange(event){
      const selectedFile = event.target.files;
      if (selectedFile) {
        setSelectedImage(URL.createObjectURL(selectedFile[0])); // create an url for the selected image (for image preview)
        setImageSelected(true);
      }
      //check the filetype to ensure it's an image. throw error if it isn't
      if (selectedFile[0]["type"] != "image/x-png" && selectedFile[0]["type"] != "image/png" && selectedFile[0]["type"] != "image/jpeg") {
        console.error("Only image files can be attached!")
        setSnackbarOpenCondition("notAnImage")
        setSnackbarOpen(true)
        return
        //if image size is > 1mb, throw error
      }else if(selectedFile[0]["size"] > 1048576){
        console.error("Image size is too big!")
        setSnackbarOpenCondition("sizeTooBig")
        setSnackbarOpen(true)
        return
      }else{
        setImageSelected(true)
        setImageFile(selectedFile[0]);
      }
    }



  //handle sending image
  useEffect(() => {
    if (isSubmittingPost) return; //prevent multiple submissions

    async function sendImage() {
      setisSubmittingPost(true); //mark submission as in progress
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("from", JSON.stringify({ currentUser }));
      formData.append("date", JSON.stringify(new Date().toISOString()));  //stringify 'date'

      try {
        await submitImagePost(formData);
        console.log("Image sent successfully!");
        setImageFile(null);
        setSelectedImage(null);
        setImageSelected(false);
      } catch (error) {
        console.error('Error:', error);
        setError(error);
      } finally {
        setisSubmittingPost(false); //reset submission state
        if (location === "navbar") {
          setImgSubmittedNavbar(false);
          if (handleClose) handleClose();
        } else if (location === "homepage") {
          setImgSubmittedHomePage(false);
        }
      }
    }

    if (location === "navbar" && imgSubmittedNavbar === true) {
      sendImage();
    } else if (location === "homepage" && imgSubmittedHomePage === true) {
      sendImage();
    }
  }, [imgSubmittedNavbar, imgSubmittedHomePage]);

  return (
    <Box>
      {/* hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className='fileInputMessageBox' 
        style={{ display: 'none' }} // hide the input
        onChange={(event) => {
          handleFileInputChange(event); // trigger when user selects an image
        }}
        accept="image/*" 
      />
      <IconButton
        id={location === 'navbar' ? 'sendAnImgButtonNavbar' : "sendAnImgButtonHomepage"}
        onClick={handleAttachmentClick}
        disabled={isSubmittingPost}
        aria-label="upload picture"
        sx={{ display: imageSelected ? "none" : "inline-flex" }} // hide the button when an image is selected
      >
        <ImageOutlinedIcon sx={{ color: isSubmittingPost ? "#B0B0B0" : '#1da1f2' }} />
      </IconButton>
    </Box>
  );
}

