import { useState, useEffect, useRef, useContext } from 'react'
import { Link, useLocation, useOutletContext, useNavigate } from "react-router-dom";
import '../styles/Home.css'
import CommentForm from "../components/CommentForm.jsx";
import FileInputPopover from "../components/Popover.jsx"
import Snackbar from "../components/Snackbar.jsx"
import { UserContext } from '../App.jsx';
import { clean } from 'profanity-cleaner';
import dayjs from 'dayjs';
import { CircularProgress, Alert } from '@mui/material';
//imports for generating the url path for routing 
import slugify from 'slugify';




function Home() {

  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated, allPosts, setAllPosts, handleLike, pressedLikePost ] = useOutletContext();

  //Pass the UserContext defined in app.jsx
  const { currentUser, selectedUser, setSelectedUser } = useContext(UserContext); 

  const [pressedSubmitPost, setPressedSubmitPost] = useState(false)
  const [value, setValue] = useState()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //user presses "send" after selecting the image
  const [imgSubmitted, setImgSubmitted] = useState(false);

  const navigate = useNavigate(); 


  function handleChange(event){
    setValue(event.target.value)
  }

  function handleSubmit(event){
    event.preventDefault();
    setPressedSubmitPost(true);
  }




 






  //fetch for getting data of all posts
  useEffect(() => {
    const getMessages = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/getallposts', {
      method: 'GET',
      })
      .then(response => {
          if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          //sort data by dates, descending order
          data.sort((post1,post2) => (post1.date < post2.date) ? 1 : ((post2.date < post1.date) ? -1 : 0))
          console.log(data)
          setAllPosts(data)
          setLoading(false)
      })
      .catch(error => {
          setError(error.message);
          console.error('Error:', error);
          setLoading(false)
      });
    };
    getMessages();
    }, [pressedSubmitPost, imgSubmitted]); 


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
    //only trigger when comment is posted
    if (pressedSubmitPost ===true){
      submitPost();
    } 
  }, [pressedSubmitPost]);







  //handle generating the url path for routing to /profile/:slug
  function handleProfileRouting(clickedOnUser){
    setSelectedUser(clickedOnUser)
    //slugify the username, e.g:"john-doe"
    const slug = slugify(clickedOnUser.name, { lower: true }); 
    //combine slug with usershortID to create the unique profile path for the selected user to route to
    const profilePath = `/profile/${slug}-${clickedOnUser.shortId}`
    // Route to the profile path
    navigate(profilePath); 
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

























  if (loading) {
    return <CircularProgress />;
  }



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
      <h2>
       ALL POSTS
      </h2>
      <ul>
      {allPosts.map((post) => (
        <li key={post._id}>
            <Link onClick={() => handleProfileRouting(post.from[0])}>
              <h3>
                {post.from[0].name}
              </h3>
            </Link>
            {post.message? 
              <p>
                {post.message}
              </p>
            :""}
            {post.image? 
              <p>
                <img className="msgBoxImg1" src={post.image} alt="image" />
              </p>
            :""}
            <p>{dayjs(new Date(post.date)).format('MMM D, H:mm')}</p>
            {/* <p>{dayjs(post.date).format('MMMM D, YYYY h:mm A')}</p> */}
            <button onClick={()=>handleLike(post._id)}>Like Post</button>
            <p>Likes: {post.likeCount}</p>
            <CommentForm 
             postID={post._id}
            />
            <p>Comments: {post.commentCount}</p>
            <br />
            <p>Comment Section of This post:</p>
            <ul>
              {/* if exists, post the comments of this post */}
            {post.comments ?
            post.comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.comment}</p>
              <p>{comment.date}</p>
              <h4>{comment.from[0].name}</h4>
            </li>
            ))
            :""}
            </ul>
            <br /> <br /> <br />
        </li>
        ))}
      </ul>


    </div>
    </>
  )
}

export default Home
