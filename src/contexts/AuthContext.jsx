/* eslint-disable react/prop-types */

//authentication context for managing user login state, session, and authentication
import { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, getUserById, logoutUser } from '../utilities/authService';
import { useNavigate } from 'react-router-dom';



const AuthContext = createContext();

function AuthProvider({ children }) {

  const [profileUpdated, setProfileUpdated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstTimeLoading, setFirstTimeLoading] = useState(true);

  const navigate = useNavigate(); 

  //get the user data when logged in, also checks if the user is logged in after each refresh
  useEffect(() => {
    const getUser = () => {
      getCurrentUser()
        .then(data => {
          setCurrentUser(data)
          setLoading(false); //set loading to false once the data is received
          setFirstTimeLoading(false);
        })
        .catch(error => {
          setLoading(false); //set loading to false once the data is received
          console.error('Error:', error);
        });
    };
    
    //only call when it's the first time loading
    if(firstTimeLoading) {
      getUser();
    }
  }, []);

  //upon user editing their profile, change the user data from the stored user data in the session, to the actual user data in the db 
  useEffect(() => {
    const getUserOnUpdate = () => {
      if (!currentUser) return;

      getUserById(currentUser["_id"])
        .then(data => {
          setCurrentUser(data[0])
          setLoading(false); //set loading to false once the data is received
        })
        .catch(error => {
          setLoading(false); //set loading to false once the data is received
          console.error('Error:', error);
        });
    };
    
    //only call after the first fetch request is complete and when profile is updated
    if (firstTimeLoading === false) {
      getUserOnUpdate();
    }
  }, [profileUpdated, firstTimeLoading]); 

    //when the user clicks on follow, refresh the currentUser state to render the followbutton correctly
    function refreshCurrentUser() {
      if (!currentUser) return;
      
      return getUserById(currentUser._id)
        .then(data => {
          setCurrentUser(data[0]);
          return data[0];
        })
        .catch(error => {
          console.error('Error refreshing user:', error);
          throw error;
        });
    }

  function handleSignOut() {
    return logoutUser()
    .then(async result => {
      if (result.ok) {
        let response = await result.json(); 
        console.warn(response); 
        await setCurrentUser(null)
        return true; //successful logout
      }
      return false; //failed loguot
    })
      .catch(error => {
        console.error('Error:', error);
        throw error;
      });
  }

  const value = {
    currentUser,
    setCurrentUser,
    profileUpdated, 
    setProfileUpdated,
    error,
    loading,
    handleSignOut,
    refreshCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };