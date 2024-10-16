/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

export const useFetchUserData = (firstTimeLoading, setFirstTimeLoading) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);


  useEffect(() => {
    const getUser = () => {
      fetch(import.meta.env.VITE_BACKEND_URL + '/login/success', {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then(response => {
          if (response.ok) {
            return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
        })
        .then(data => {
          setCurrentUser(data);
          setLoading(false); // Set loading to false once the data is received
          setFirstTimeLoading(false);
        })
        .catch(error => {
          setLoading(false); // Set loading to false once the data is received
          setError(error);
          console.error('Error:', error);
        });
    };
    //only call when it's the first time loading
    if (firstTimeLoading) {
      getUser();
    }
  }, [firstTimeLoading]);

  return { /* currentUser, setCurrentUser */};
};