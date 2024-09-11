/* eslint-disable react/prop-types */
import { useState, useContext } from 'react'
import { UserContext, AppStatesContext } from '../App.jsx';
import { Box, Container, Stack, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AccountProfile } from '../components/account-profile.jsx';
import { AccountProfileChangeForm } from '../components/account-profile-changeForm.jsx';
import Snackbar from "../components/Snackbar.jsx"
import "../styles/ProfileEdit.css"




const ProfileEdit = () => {

 const { snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated } = useContext(AppStatesContext); 

  // Pass the UserContext defined in app.jsx
  const { currentUser} = useContext(UserContext); 

  //check if the e-mail address user puts is invalid
  const [invalidEmail, setInvalidEmail] = useState(false); 

  
 return ( 
  <>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <div>
            <Typography variant="h4">
              Edit Profile
            </Typography>
          </div>
          <div>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={6}
                lg={4}
              >
              <AccountProfile
              user={currentUser}
              setProfileUpdated={setProfileUpdated}
              />
              </Grid>
              <Grid
                xs={12}
                md={6}
                lg={8}
              >
                <AccountProfileChangeForm 
                user={currentUser}
                setCurrentUser={setCurrentUser}
                setSnackbarOpen={setSnackbarOpen}
                invalidEmail={invalidEmail}
                setInvalidEmail={setInvalidEmail}
                setSnackbarOpenCondition={setSnackbarOpenCondition}
                snackbarOpenCondition={snackbarOpenCondition}
                profileUpdated={profileUpdated}
                setProfileUpdated={setProfileUpdated}
                />
              </Grid>
            </Grid>
          </div>
        </Stack>
      </Container>
      <Snackbar
      snackbarOpenCondition={snackbarOpenCondition}
      snackbarOpen={snackbarOpen}
      setSnackbarOpen={setSnackbarOpen}
      invalidEmail={invalidEmail}
      />
    </Box>
  </>
);
}


export default ProfileEdit;

