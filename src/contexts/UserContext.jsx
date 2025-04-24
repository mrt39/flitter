/* eslint-disable react/prop-types */

//user context for managing selected user profile data and profile updates
import { createContext, useState, useContext } from 'react';
import { getUserByShortId } from '../utilities/authService';
import { useNavigate } from 'react-router-dom';
import { createProfileRoute } from '../utilities/routingUtils';

const UserContext = createContext();

function UserProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  //handle profile routing for user clicks
  function handleProfileRouting(clickedOnUser) {
    setSelectedUser(clickedOnUser);
    const profilePath = createProfileRoute(clickedOnUser);
    navigate(profilePath);
  }

  //function to fetch user by shortId (for profile page)
  function fetchUserByShortId(shortId) {
    return getUserByShortId(shortId)
      .then(data => {
        setSelectedUser(data[0]);
        return data[0];
      })
      .catch(error => {
        console.error('Error fetching user:', error);
        throw error;
      });
  }

  const value = {
    selectedUser,
    setSelectedUser,
    handleProfileRouting,
    fetchUserByShortId
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  return useContext(UserContext);
}

export { UserProvider, useUser };