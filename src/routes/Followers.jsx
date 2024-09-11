/* eslint-disable react/prop-types */
import { useState, useContext, useEffect } from 'react'
import { useLocation, Link, useNavigate} from "react-router-dom";
import { UserContext } from '../App.jsx';
import { Avatar, ListItem, ListItemAvatar, ListItemText, Typography, Paper } from '@mui/material';
import { CircularProgress, Alert } from '@mui/material';
//import for generating the url path for routing 
import slugify from 'slugify';


const Followers = () => {

  // Pass the UserContext defined in app.jsx
  const { setSelectedUser } = useContext(UserContext); 


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followerData, setFollowerData] = useState({});
  const [currentPath, setCurrentPath] = useState({});

  //get the shortid of the user from the current URL
  const location = useLocation();
  // Get the pathname from the location object
  const path = location.pathname;
  // Extract the last 8 characters
  const shortID = path.slice(-18, -10);



    //get whether it's /following or /followers path and store it in currentPath state
    useEffect(() => {
        setCurrentPath(path.slice(-9));
        }, []); 


    

    //fetch for getting the follower data of the user, based on their id
    useEffect(() => {
        const getFollowerData = () => {
            fetch(import.meta.env.VITE_BACKEND_URL+'/followers/'+shortID, {
            method: 'GET',
            })
            .then(response => {
                if (response.ok) {
                return response.json(); // Parse JSON when the response is successful
                }
                throw new Error('Network response was not ok.');
            })
            .then(data => {
                setFollowerData(data[0])
                console.log(data[0])
                setLoading(false)
            })
            .catch(error => {
                setError(error.message);
                setLoading(false)
                console.error('Error:', error);
            });
        };
        getFollowerData();
        }, []); 


    
    const navigate = useNavigate(); 

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


if (loading) {
    return <CircularProgress />;
    }



    if (error) {
    return <Alert severity="error">{error}</Alert>;
    }

  return (
    <Paper elevation={3} style={{ padding: '20px', maxWidth: '400px', margin: '20px auto' }}>
      <Typography variant="h6" component="div" gutterBottom>
        {currentPath==="following"
        ? 
        "Following"
        :
        "Followers"
        }
      </Typography>
      {currentPath==="following"
        ? 
            followerData.following.length>0?
                followerData.following.map((follower) => (
                    <ListItem key={follower._id}>
                    <ListItemAvatar>
                        <Avatar alt={follower.name} src={follower.uploadedpic? follower.uploadedpic : follower.picture} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Link onClick={() => handleProfileRouting(follower)} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h3>{follower.name}</h3>
                            </Link>
                        }
                        secondary={follower.bio}
                    />
                </ListItem>
                ))
                
            : <p>This user isn't following anyone.</p>
        :
            followerData.followedby.length>0?
                followerData.followedby.map((follower) => (
                    <ListItem key={follower._id}>
                    <ListItemAvatar>
                    <Avatar alt={follower.name} src={follower.uploadedpic? follower.uploadedpic : follower.picture} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Link onClick={() => handleProfileRouting(follower)} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h3>{follower.name}</h3>
                            </Link>
                        }
                        secondary={follower.bio}
                        />
                </ListItem>
                ))
            : <p>This user isn't followed by anyone.</p>
        }

    </Paper>
  );
};


export default Followers;