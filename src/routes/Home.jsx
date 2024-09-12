/* eslint-disable react/prop-types */
import '../styles/Home.css'
import {useContext } from 'react'
import PostsDisplay from '../components/PostsDisplay.jsx';
import { UserContext } from '../App.jsx';
import SubmitPostFormHomePage from '../components/SubmitPostFormHomePage.jsx';






function Home() {

  //Pass the UserContext defined in app.jsx
  const { currentUser } = useContext(UserContext); 








  return (
    <>
    <div className='homeContainer'>

      <h1>
       THIS IS HOMEPAGE
      </h1>

      {/* use different react components for forms in homepage and navbar in order to seperate concerns and avoid state/post logic clashing */}
      <SubmitPostFormHomePage
       currentUser={currentUser}
      />

      <br /><br /> <br /><br /> <br /><br />
      <PostsDisplay
      />


    </div>
    </>
  )
}

export default Home
