/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from 'react'
import '../styles/Home.css'
import FileInputPopover from "../components/Popover.jsx"
import Snackbar from "../components/Snackbar.jsx"
import { UserContext, AppStatesContext } from '../App.jsx';
import { clean } from 'profanity-cleaner';
import { CircularProgress, Alert } from '@mui/material';
import PostsDisplay from '../components/PostsDisplay.jsx';




function Home() {

  //Pass the UserContext defined in app.jsx
  const { currentUser} = useContext(UserContext); 

  const { snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, imgSubmitted, setImgSubmitted, pressedSubmitPost, setPressedSubmitPost, } = useContext(AppStatesContext); 



  //value in the form for submitting posts
  const [value, setValue] = useState()
  const [error, setError] = useState(null);



  function handleChange(event){
    setValue(event.target.value)
  }

  function handleSubmit(event){
    event.preventDefault();
    setPressedSubmitPost(true);
  }



  //useeffect to handle submitting blog posts
  useEffect(() => {
    async function submitPost() {
      //on submit, clean the words with the profanity cleaner package
      //https://www.npmjs.com/package/profanity-cleaner
      let filteredPostMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' }) 

      await fetch(import.meta.env.VITE_BACKEND_URL+'/submitPost', {
        method: "post",
        // store date as isostring to make the reading easier later
        body: JSON.stringify({ from: currentUser, date: new Date().toISOString(), message: filteredPostMessage}), 
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
        credentials:"include" //required for sending the cookie data-authorization check
    })
      .then(async result => {
        if (result.ok){
          await result.json();
          console.log("Posted Succesfully!")
          setPressedSubmitPost(false)
        } else{
          throw new Error(result)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setPressedSubmitPost(false)
      }); 
    }
    //only trigger when post is submitted
    if (pressedSubmitPost ===true){
      submitPost();
    } 
  }, [pressedSubmitPost]);











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
      setImgSubmitted(true);
  }

  //effect for handling posting the image
  useEffect(() => {
    async function sendImage() {

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
            setImgSubmitted(false);
          } else{
            throw new Error(result);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
    //only trigger when message is sent
    if (imgSubmitted ===true){
      sendImage();
    } 
  }, [imgSubmitted]);
























  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }




  return (
    <>
    <div className='homeContainer'>

      <h1>
       THIS IS HOMEPAGE
      </h1>



      <form onSubmit={handleSubmit}>
        <label>
          Send a Post:
          <textarea value={value} onChange={handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <br /><br />
      <br /><br />





      <button id="sendAnImgButton" onClick={handleAttachmentClick}>
        Send An Image!
      </button>
      <input ref={fileInputRef} type='file' name='fileInput' accept="image/*" className='fileInputMessageBox'
        onChange={handleFileInputChange}
        />
        <FileInputPopover
        popOveranchorEl={popOveranchorEl}
        imgSubmitted={imgSubmitted}
        setPopOverAnchorEl={setPopOverAnchorEl}
        setimageSelected={setimageSelected}
        handleImgSendBtn={handleImgSendBtn}
        />
        <Snackbar
        snackbarOpenCondition={snackbarOpenCondition}
        snackbarOpen={snackbarOpen}
        setSnackbarOpen={setSnackbarOpen}
      />




      <br /><br /> <br /><br /> <br /><br />
      <PostsDisplay
      />


    </div>
    </>
  )
}

export default Home
