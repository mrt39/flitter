/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from 'react';
import { IconButton, Box } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import FileInputPopover from "./Popover.jsx";
import { AppStatesContext, UserContext} from '../App.jsx';

export default function ImageUploadButton({ location, handleClose, setError}) {
  const { setImgSubmittedNavbar, setImgSubmittedHomePage, isSubmittingPost, 
    imgSubmittedNavbar, imgSubmittedHomePage, setSnackbarOpenCondition, 
    setSnackbarOpen, setisSubmittingPost } = useContext(AppStatesContext);

    const {currentUser} = useContext(UserContext); 

  //use ref to be able to select an element within a function (for displaying popover)
  const fileInputRef = useRef(null);

  //anchor for popover
  const [popOveranchorEl, setPopOverAnchorEl] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  //trigger when user selects an image
  const [imageSelected, setImageSelected] = useState(false);

  //when the attachment icon is clicked, click on the hidden input (type=file) element
  function handleAttachmentClick() {
      fileInputRef.current.click(); // Trigger file input
  }

  //when user selects an image and changes the value of the input, change the state 
  function handleFileInputChange(event){
      const selectedFile = event.target.files;
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

  //when an image is selected, activate the popover
  useEffect(() => {
      //only trigger if an image is selected
      if (imageSelected){
        var attachmentIcon = null
        // select the attachment button next to the message input box and make it the anchor for the popover to be displayed over
        // if the image is selected from navbar, attach the button to navbar. if from homepage, attach it to homepage.
        {location === 'navbar' ? 'sendAnImgButtonNavbar' : "sendAnImgButtonHomepage"}
        if (document.querySelector('#sendAnImgButtonNavbar')){
          attachmentIcon = document.querySelector('#sendAnImgButtonNavbar')
        } else {
          attachmentIcon = document.querySelector('#sendAnImgButtonHomepage')
        }
        setPopOverAnchorEl(attachmentIcon)
      }
  }, [imageSelected]);

  //function for sending the image
  function handleImgSendBtn() {
      //use two different states for posting image from navbar form and homepage form, as otherwise they clash while posting
      if (location === "navbar") {
          setImgSubmittedNavbar(true);
      } else if (location === "homepage") {
          setImgSubmittedHomePage(true);
      }
  }

  // Effect for sending image
  useEffect(() => {
    if (isSubmittingPost) return; // Prevent multiple submissions

    async function sendImage() {
        setisSubmittingPost(true); // Mark submission as in progress
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("from", JSON.stringify({ currentUser }));
        formData.append("date", JSON.stringify(new Date().toISOString()));  // Stringify 'date'

        try {
            const result = await fetch(import.meta.env.VITE_BACKEND_URL + '/imagesent', {
                method: "POST",
                //if imageFile exists, send imageFile  
                body: formData,
                credentials: "include" // Include credentials like cookies
            });

            if (result.ok) {
                await result.json();
                console.log("Image sent successfully!");
                setImageFile(null);
            } else {
                throw new Error(result);
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error);
        } finally {
            setisSubmittingPost(false); // Reset submission state
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
        style={{ display: 'none' }} // Hide the input
        onChange={handleFileInputChange}
        accept="image/*" 
      />
      <IconButton
        id={location === 'navbar' ? 'sendAnImgButtonNavbar' : "sendAnImgButtonHomepage"}
        onClick={handleAttachmentClick}
        disabled={isSubmittingPost}
        aria-label="upload picture"
      >
        <ImageOutlinedIcon sx={{ color: isSubmittingPost? "#B0B0B0":'#1da1f2' }} />
      </IconButton>

      {/* Render popover if image is selected */}
      {imageSelected && (
        <FileInputPopover 
        popOveranchorEl={popOveranchorEl}
        imgSubmittedHomePage={imgSubmittedHomePage}
        imgSubmittedNavbar = {imgSubmittedNavbar}
        setPopOverAnchorEl={setPopOverAnchorEl}
        setImageSelected={setImageSelected}
        handleImgSendBtn={handleImgSendBtn}
        />
      )}
    </Box>
  );
}

