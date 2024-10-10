/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from 'react';
import { Modal, Box, Typography, IconButton, Button, TextField, CircularProgress, Card, CardContent, CardActions, Backdrop } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AppStatesContext, UserContext } from '../App.jsx';
import { clean } from 'profanity-cleaner';
import UserAvatar from './UserAvatar.jsx';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import "../styles/EditProfileModal.css";

const EditProfileModal = ({ open, handleClose }) => {
  const { setSnackbarOpenCondition, setSnackbarOpen, setProfileUpdated, darkModeOn } = useContext(AppStatesContext);
  const { currentUser } = useContext(UserContext);

  const [uploadedImg, setUploadedImg] = useState();
  const [imgSubmitted, setImgSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    name: currentUser.name,
    email: currentUser.email,
    bio: currentUser.bio,
  });
  const [clickedOnProfileUpdate, setClickedOnProfileUpdate] = useState(false);
  //check if the e-mail address currentUser puts is invalid
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [showSaveImageButton, setShowSaveImageButton] = useState(false);


  function handleImageChange(event) {
    const uploadedImg = event.target.files[0];
    //check the filetype to ensure it's an image. throw error if it isn't
    if (uploadedImg["type"] !== "image/x-png" && uploadedImg["type"] !== "image/png" && uploadedImg["type"] !== "image/jpeg") {
      console.error("Only image files can be attached!");
      setSnackbarOpenCondition("notAnImage");
      setSnackbarOpen(true);
      return;
       //if image size is > 1mb, throw error
    } else if (uploadedImg["size"] > 1048576) {
      console.error("Image size is too big!");
      setSnackbarOpenCondition("sizeTooBig");
      setSnackbarOpen(true);
      return;
    } else {
      setUploadedImg(event.target.files[0]);
      setShowSaveImageButton(true);
    }
  }

  function submitImg() {
    setImgSubmitted(true);
    setLoading(true);
  }

  //handle uploading image
  useEffect(() => {
    async function changeProfileImage() {
      const formData = new FormData();
      formData.append("image", uploadedImg);

      fetch(import.meta.env.VITE_BACKEND_URL + '/uploadprofilepic/' + currentUser["_id"], {
        method: "post",
        body: formData,
        headers: {
          "Access-Control-Allow-Origin": "*",
        }
      })
        .then(async result => {
          if (result.ok) {
            await result.json();
            console.log("Image uploaded");
            setUploadedImg(null);
            /* setImgSubmitted(false); */
            setProfileUpdated(true);
          } else {
            throw new Error(result);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        })
        .finally(() => {
            setLoading(false);
            setImgSubmitted(false);
            setShowSaveImageButton(false)
        });
    }
    //only trigger when image is sent
    if (imgSubmitted === true) {
      changeProfileImage();
    }
  }, [imgSubmitted]);

  function handleChange(event) {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  }

  //email validation
  useEffect(() => {
    if (values.email.includes("@")) {
      //if the snackbar is already opened, close it
      setSnackbarOpen(false);
      //wait until snackbar closes to change the e-mail invalid state
      setTimeout(() => {
        setInvalidEmail(false);
      }, 200);
    } else {
      setSnackbarOpen(false);
      setTimeout(() => {
        setInvalidEmail(true);
      }, 200);
    }
  }, [values.email]);

  function handleSubmit(event) {
    event.preventDefault();
    //if mail address is invalid, don't update
    if (invalidEmail) {
      setSnackbarOpenCondition("wrongEmail");
      setSnackbarOpen(true);
      return;
    } else if (values.name.length > 30) {
      setSnackbarOpenCondition("nameTooLong");
      setSnackbarOpen(true);
      return;
    } else if (values.bio && values.bio.length > 100) {
      setSnackbarOpenCondition("bioTooLong");
      setSnackbarOpen(true);
      return;
    } else if (values.email.length > 50) {
      setSnackbarOpenCondition("emailTooLong");
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    setClickedOnProfileUpdate(true);
    setProfileUpdated(false);
  }

  //submit the profile changes
  useEffect(() => {
    async function editProfile() {
      //on submit, clean the word with the profanity cleaner
      //https://www.npmjs.com/package/profanity-cleaner
      let filteredName = await clean(values.name, { keepFirstAndLastChar: true, placeholder: '#' });
      let filteredEmail = await clean(values.email, { keepFirstAndLastChar: true, placeholder: '#' });
      let filteredBio = values.bio ? await clean(values.bio, { keepFirstAndLastChar: true, placeholder: '#' }) : "";

      fetch(import.meta.env.VITE_BACKEND_URL + '/editprofile/' + currentUser["_id"], {
        method: 'PATCH',
        body: JSON.stringify({ name: filteredName, email: filteredEmail, bio: filteredBio }),
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include" //required for sending the cookie data-authorization check
      })
        .then(async result => {
          if (result.ok) {
            await result.json();
            console.log("Profile Updated!");
            await setProfileUpdated(true);
            await setSnackbarOpenCondition("profileChangeSuccess");

          } else {
            console.error("There has been an error!");
            setSnackbarOpenCondition("failure");
            setProfileUpdated(false);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        })
        .finally(() => {
            setLoading(false);
            setClickedOnProfileUpdate(false);
            setSnackbarOpen(true);
        });
    }

    //only trigger when profile is updated
    if (clickedOnProfileUpdate === true) {
      editProfile();
    }
  }, [clickedOnProfileUpdate]);

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      slotProps={{
        backdrop: {
          style: { backgroundColor: 'rgba(50, 50, 50, 0.5)' } // change the backdrop background color here
        }
      }}
    >
      <Box className={`modalBox ${darkModeOn ? 'dark-mode' : ''}`}>
        <Box className="modalHeader">
          <Typography variant="h6" fontWeight="bold" sx={{ml:"22px"}}>Edit Profile</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <form 
          autoComplete="off" 
          noValidate 
          onSubmit={handleSubmit}
          className='editProfileForm'
        >
          <Card className="profileCard">
            <CardContent className="profileCard-content">
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
              <Box className="profileFieldsBox">
                <TextField
                  disabled={loading || currentUser.email === "demoacc@demoacc.com"}
                  fullWidth
                  label="Name"
                  name="name"
                  onChange={handleChange}
                  required
                  value={values.name}
                />
                <TextField
                  disabled={loading || currentUser.googleId || currentUser.email === "demoacc@demoacc.com"}
                  fullWidth
                  error={invalidEmail}
                  helperText={invalidEmail ? 'Invalid E-mail address!' : ' '}
                  label="E-mail Address"
                  name="email"
                  type="email"
                  required
                  onChange={handleChange}
                  value={values.email}
                />
                <TextField
                  disabled={loading || currentUser.email === "demoacc@demoacc.com"}
                  fullWidth
                  id="bio"
                  label="Bio"
                  name="bio"
                  multiline
                  rows={4}
                  placeholder="Enter Your Bio"
                  onChange={handleChange}
                  value={values.bio}
                />
              </Box>
            </CardContent>
            <CardActions className="profileCardActions">
            <Button
              variant="outlined"
              size="small"
              onClick={handleSubmit}
              disabled={loading || currentUser.email === "demoacc@demoacc.com"}
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
                Save
            </Button>
            </CardActions>
          </Card>
        </form>
        <Backdrop open={loading} className="backdrop">
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </Modal>
  );
};

export default EditProfileModal;