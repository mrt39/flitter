/* eslint-disable react/prop-types */
import { useState,  useEffect} from 'react'
import {Avatar, Box} from '@mui/material';
import '../styles/UserAvatar.css'

//give hash color to a word
function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}


const UserAvatar = ({user, source}) => {

  //classname state for the image, changed depending on the source (component the image is being rendered on)
  const [className, setClassname] = useState();

  function stringAvatar(name) {
    return {
      children: 
      <Box
      sx={{
        fontWeight: "bold",
        fontSize: className ==="userCardProfile-avatar" || className === "editProfileModal-avatar"? "2.5rem" : "1.5rem"
      }}
      >
      {
       name.includes(" ")? //if there are multiple words in name
      `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`
      : 
      `${name[0]}`}
      </Box>
    };
  }

  useEffect(() => {
    if(source === "userCardProfile"){
      setClassname("userCardProfile-avatar")
    } else if(source === "post"){
      setClassname("post-avatar")
    } else if(source === "editProfileModal"){
      setClassname("editProfileModal-avatar")
    }
}, []);

  return (
    /* if the user has an uploadedpic or picture(from google), use it. otherwise, create an avatar from the initials and color algorithm above. */
       user.uploadedpic || user.picture? 
       <Avatar 
          src={user.uploadedpic? user.uploadedpic : user.picture} 
          //referrerPolicy is required to GET the images from google database without an error.
          imgProps={{ referrerPolicy: "no-referrer" }} 
          alt={`${user.name} avatar`}
          className={className}
       />
        :
        <Avatar 
          {...stringAvatar(user.name)}  
          sx={{ bgcolor: stringToColor(user.name)} }
          alt={`${user.name} avatar`}
          className={className}
        />
  );
}

export default UserAvatar

