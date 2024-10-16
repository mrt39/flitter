/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

export const useFetchProfileUpdate = (currentUser, setCurrentUser, profileUpdated, setProfileUpdated, firstTimeLoading) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUserOnUpdate = () => {
      fetch(import.meta.env.VITE_BACKEND_URL + '/profile/' + currentUser["_id"], {
        method: 'GET',
      })
        .then(response => {
          if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          setCurrentUser(data[0]);
          setLoading(false); // Set loading to false once the data is received
          setProfileUpdated(false);
        })
        .catch(error => {
          setLoading(false); // Set loading to false once the data is received
          console.error('Error:', error);
        });
      setProfileUpdated(false);
    };
    // only call after the first fetch request is complete 
    if (firstTimeLoading === false) {
      getUserOnUpdate();
    }
    // when first fetch is complete or profile is updated, update the currentUser state 
  }, [profileUpdated, firstTimeLoading]);

  return { loading };
};