/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { Outlet, Navigate } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from './components/Snackbar.jsx';
import SidebarLeft from './components/SidebarLeft.jsx';
import SidebarRight from './components/SidebarRight.jsx';
import { Box, CircularProgress } from '@mui/material';
import { useRef } from "react";
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { UserProvider } from './contexts/UserContext.jsx';
import { UIProvider, useUI } from './contexts/UIContext.jsx';
import { PostProvider } from './contexts/PostContext.jsx';
import { FollowProvider } from './contexts/FollowContext.jsx';
import './styles/App.css'


//main app component that manages routes and context providers
const App = () => {

  const appContainerRef = useRef(null);

  return (
    //add referance to the app container to determine the scrollable target for the infinite scroll
    <div className='appContainer' ref={appContainerRef}>
      {/* pass the appContainerRef to UI context, to be used in AllPostsDisplay and AllCommentsDisplay components, for infinite scrolling functionality */}
      <UIProvider  appContainerRef={appContainerRef}>
        <AuthProvider>
          <UserProvider>
            <PostProvider>
              <FollowProvider>
                <AppContent/>
              </FollowProvider>
            </PostProvider>
          </UserProvider>
        </AuthProvider>
      </UIProvider>
    </div>
  );
};

//separate component for app content to use context hooks
function AppContent() {
  const { theme, snackbarOpen, setSnackbarOpen, snackbarOpenCondition } = useUI();
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className='circularProgressContainer'>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress size="5rem" />
        </Box>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Snackbar
        snackbarOpenCondition={snackbarOpenCondition}
        snackbarOpen={snackbarOpen}
        setSnackbarOpen={setSnackbarOpen}
      />

      {currentUser ? (
        <>
          <SidebarLeft />
          <div className="outletContainer">
            <Outlet />
          </div>
          <SidebarRight />
        </>
      ) : (
        // If not logged in, only render outlet and navigate to /login
        <>
          <Outlet />
          <Navigate to="/login" />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;