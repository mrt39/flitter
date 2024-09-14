/* eslint-disable react/prop-types */
import { Box, Container, Stack, Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AccountProfile } from '../components/account-profile.jsx';
import { AccountProfileChangeForm } from '../components/account-profile-changeForm.jsx';
import "../styles/ProfileEdit.css"




const ProfileEdit = () => {


  
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
              <AccountProfile/>
              </Grid>
              <Grid
                xs={12}
                md={6}
                lg={8}
              >
                <AccountProfileChangeForm/>
              </Grid>
            </Grid>
          </div>
        </Stack>
      </Container>
    </Box>
  </>
);
}


export default ProfileEdit;

