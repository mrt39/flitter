/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from 'react'
import { AppStatesContext } from '../App.jsx';
import FileInputPopover from "../components/Popover.jsx"
import Snackbar from "../components/Snackbar.jsx"
import { Alert } from '@mui/material';
import { clean } from 'profanity-cleaner';




export default function SubmitPostFormHomepage({currentUser}) {


    const { snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, imgSubmittedHomePage, setImgSubmittedHomePage, pressedSubmitPostHome, setPressedSubmitPostHome, isSubmittingPost, setisSubmittingPost } = useContext(AppStatesContext); 


    //value in the form for submitting posts
    const [value, setValue] = useState("")
    const [error, setError] = useState(null);


    function handleChange(event){
        setValue(event.target.value);
    }
  
  //not using useEffect for the sending posts fetch api in order to not make both homepage form and navbar form trigger at the same time
  // Submit the post directly when submitting the homepage form
  async function handleSubmitHome(event) {
    event.preventDefault();
    if (isSubmittingPost) return; // Prevent multiple submissions

    setisSubmittingPost(true); // Mark submission as in progress

    try {
      const filteredPostMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' });

      const result = await fetch(import.meta.env.VITE_BACKEND_URL + '/submitPost', {
        method: "post",
        body: JSON.stringify({ from: currentUser, date: new Date().toISOString(), message: filteredPostMessage }),
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include" //required for sending the cookie data
      });

      if (result.ok) {
        await result.json();
        console.log("Posted Successfully!");
        setValue(""); // Clear form after success
      } else {
        throw new Error(result);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error);
    } finally {
      setisSubmittingPost(false); // Reset submission state
      setPressedSubmitPostHome(!pressedSubmitPostHome)
    }
  }



   /* ---------------IMAGE UPLOAD FUNCTIONALITY--------------- */




  
  //use ref to be able to select an element within a function (for displaying popover)
  const fileInputRef = useRef(null)
  //anchor for popover
  const [popOveranchorEl, setPopOverAnchorEl] = useState(null);

  const [imageFile, setimageFile] = useState();
  //trigger when user selects an image
  const [imageSelected, setimageSelected] = useState(false);


    //when the attachment icon is clicked, click on the hidden input (type=file) element
    function handleAttachmentClick(){
      fileInputRef.current.click()
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
    setimageSelected(true)
    setimageFile(selectedFile[0]);
    }
  }

  //when an image is selected, activate the popover
  useEffect(() => {
    //only trigger if an image is selected
    if (imageSelected){
    /* select the attachment button next to the message input box and make it the anchor for the popover to be displayed over */
    const attachmentIcon = document.querySelector('#sendAnImgButton')
    setPopOverAnchorEl(attachmentIcon)
    }
  }, [imageSelected]);

  //function for sending the image
  function handleImgSendBtn(){
    setImgSubmittedHomePage(true);
  }

  //effect for handling posting the image
  useEffect(() => {
    if (isSubmittingPost) return; // Prevent multiple submissions

    async function sendImage() {

      setisSubmittingPost(true); // Mark submission as in progress
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("from", JSON.stringify({currentUser}) );
      formData.append("date", JSON.stringify(new Date().toISOString()) );
      
      await fetch(
        import.meta.env.VITE_BACKEND_URL+'/imagesent', {
            method: "post",
            //if imageFile exists, send imageFile  
            body: formData, 
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            credentials:"include" //required for sending the cookie data
        })
        .then(async result => {
          if(result.ok){
            await result.json()
            console.log("Image sent");
            setimageFile("");
          } else{
            throw new Error(result);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setError(error)
        })
        .finally(() =>{
        setisSubmittingPost(false); // Reset submission state
        setImgSubmittedHomePage(false)
        });
    }
    //only trigger when message is sent
    if (imgSubmittedHomePage ===true){
      sendImage();
    } 
  }, [imgSubmittedHomePage]);





  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
        <form onSubmit={handleSubmitHome}>
          <label>
            What's on your mind?
            <textarea value={value} onChange={handleChange} />
          </label>
          <input type="submit" value="Submit" disabled={isSubmittingPost} />
        </form>

        <br /><br />
        <br /><br />

        <button id="sendAnImgButton" onClick={handleAttachmentClick}
            disabled={isSubmittingPost}
        >
            Send An Image!
        </button>
        <input ref={fileInputRef} type='file' name='fileInput' accept="image/*" className='fileInputMessageBox'
            onChange={handleFileInputChange}
            disabled={isSubmittingPost}
            />
        <FileInputPopover
            popOveranchorEl={popOveranchorEl}
            imgSubmitted={imgSubmittedHomePage}
            setPopOverAnchorEl={setPopOverAnchorEl}
            setimageSelected={setimageSelected}
            handleImgSendBtn={handleImgSendBtn}
        />
        <Snackbar
            snackbarOpenCondition={snackbarOpenCondition}
            snackbarOpen={snackbarOpen}
            setSnackbarOpen={setSnackbarOpen}
        />
   </>
  );
}