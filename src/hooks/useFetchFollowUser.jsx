/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

export const useFetchFollowUser = (currentUser, pressedFollow, setPressedFollow) => {
  const [usertoFollow, setUsertoFollow] = useState();
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    async function followUser() {
      await fetch(import.meta.env.VITE_BACKEND_URL + '/followUser', {
        method: "post",
        body: JSON.stringify({ fromUser: currentUser, toUser: usertoFollow }),
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*",
        },
        credentials: "include" //required for sending the cookie data-authorization check
      })
        .then(async result => {
          if (result.ok) {
            await result.json();
            console.log("Followed/Unfollowed Succesfully!");
            setPressedFollow(false);
            setLoadingFollow(false);
          } else {
            throw new Error(result);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setPressedFollow(false);
          setLoadingFollow(false);
        });
    }
    // Only trigger when pressedFollow is true and loading is true
    if (pressedFollow && loadingFollow) {
      followUser();
    }
  }, [pressedFollow, loadingFollow]);

  return { usertoFollow, setUsertoFollow, loadingFollow, setLoadingFollow };
};