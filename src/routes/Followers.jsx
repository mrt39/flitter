import { useState, useContext, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { UserContext } from '../App.jsx';
import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Typography, Paper } from '@mui/material';
import { CircularProgress, Alert } from '@mui/material';


// Sample user data for followers
const followers = [
  { id: 1, name: 'John Doe', avatarUrl: 'https://via.placeholder.com/50', bio: 'Web developer and tech enthusiast' },
  { id: 2, name: 'Jane Smith', avatarUrl: 'https://via.placeholder.com/50', bio: 'Designer and artist' },
  { id: 3, name: 'Alex Johnson', avatarUrl: 'https://via.placeholder.com/50', bio: 'Full-stack developer' },
];

const Followers = () => {

  // Pass the UserContext defined in app.jsx
  const { currentUser, selectedUser, setSelectedUser } = useContext(UserContext); 


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
            followerData.following.map((follower) => (
                <ListItem key={follower.id}>
                <ListItemAvatar>
                    <Avatar alt={follower.name} src={follower.uploadedpic? follower.uploadedpic : follower.picture} />
                </ListItemAvatar>
                <ListItemText
                    primary={follower.name}
                    secondary={follower.bio}
                />
            </ListItem>
            ))
        :
            followerData.followedby.map((follower) => (
                <ListItem key={follower.id}>
                <ListItemAvatar>
                    <Avatar alt={follower.name} src={follower.avatarUrl} />
                </ListItemAvatar>
                <ListItemText
                    primary={follower.name}
                    secondary={follower.bio}
                />
            </ListItem>
            ))
        }

    </Paper>
  );
};


export default Followers;