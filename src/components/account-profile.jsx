/* eslint-disable react/prop-types */
import {
  Button,
  Card,
  CardActions,
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { AppStatesContext, UserContext } from '../App.jsx';
import "../styles/Account-Profile.css"
import UserAvatar from './UserAvatar.jsx';


export const AccountProfile = () => {

const { setSnackbarOpenCondition, setSnackbarOpen, setProfileUpdated } = useContext(AppStatesContext); 

// Pass the UserContext defined in app.jsx
const {currentUser} = useContext(UserContext); 


const [uploadedImg, setUploadedImg] = useState();
const [imgSubmitted, setImgSubmitted] = useState(false);


function handleChange(event){
  const uploadedImg = event.target.files[0]
  //check the filetype to ensure it's an image. throw error if it isn't
  if (uploadedImg["type"] != "image/x-png" && uploadedImg["type"] != "image/png" && uploadedImg["type"] != "image/jpeg") {
    console.error("Only image files can be attached!")
    setSnackbarOpenCondition("notAnImage")
    setSnackbarOpen(true)
    return
    //if image size is > 1mb, throw error
  }else if(uploadedImg["size"] > 1048576){
    console.error("Image size is too big!")
    setSnackbarOpenCondition("sizeTooBig")
    setSnackbarOpen(true)
    return
  }else{
  setUploadedImg(event.target.files[0]);
  }
}

function submitImg(){
  setImgSubmitted(true)
}

//effect for handling uploading image
useEffect(() => {
async function changeProfileImage() {       

  const formData = new FormData()
  formData.append("image", uploadedImg)

    fetch(import.meta.env.VITE_BACKEND_URL+'/uploadprofilepic/' + currentUser["_id"], {
        method: "post",
        body: formData, 
        headers: {
            "Access-Control-Allow-Origin": "*",
        }
    })
    .then(async result =>{
      if (result.ok){
      await result.json();
      console.log("Image uploaded");
      setUploadedImg(null);
      setImgSubmitted(false);
      setProfileUpdated(true)
      } else{
      throw new Error(result);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });

}
//only trigger when image is sent
if (imgSubmitted ===true){
  changeProfileImage();
} 
}, [imgSubmitted]);

return (
  <Card>
        <div className="card">
          <div className="card-body">
            <div className="d-flex flex-column align-items-center text-center profileAvatar">
              <MuiAvatar
              user={currentUser}
              profilePageAvatar="yes"
              />                  
              <div className="mt-3">
                <h4>{currentUser.name}</h4>
                <p className="text-secondary mb-1">{currentUser.email}</p>
                <p className="text-muted font-size-sm">{currentUser.bio}</p>
              </div>
            </div>
          </div>
        </div>
  <CardActions className='accountProfileCardActions'>

    <input 
    disabled = {currentUser.email === "demoacc@demoacc.com" ? true : false}
    type="file" 
    className="hidden"
    value=""
    id="image" 
    name="image" 
    accept="image/*"
    onChange={handleChange}/>

    {/* hide the input field and choose  a label for the functionality, as input brings its own embedded css, easier to modify label*/}
    <Button 
    variant="contained"
    disabled = {currentUser.email === "demoacc@demoacc.com" ? true : false}
    >
      <label htmlFor="image" className="imgLbl">Choose an Image</label>

    </Button>

    <Button 
    disabled = {currentUser.email === "demoacc@demoacc.com" ? true : false}
    variant="contained"
    onClick={submitImg}
    >
      Submit
    </Button>
  
</CardActions>
</Card>
)
};


