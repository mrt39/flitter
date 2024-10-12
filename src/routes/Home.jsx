/* eslint-disable react/prop-types */
import '../styles/Home.css'
import {useContext, useState } from 'react'
import { UserContext, AppStatesContext } from '../App.jsx';
import SubmitPostForm from '../components/SubmitPostForm.jsx';
import AllPostsDisplay from '../components/AllPostsDisplay.jsx';
import HomepageTopSection from '../components/HomepageTopSection.jsx';





function Home() {

  //Pass the UserContext defined in app.jsx
  const { currentUser } = useContext(UserContext); 
  const { darkModeOn} = useContext(AppStatesContext); 


  return (
    <>
    <div className='homeContainer'>
      <div className={`homePageTop-container ${darkModeOn ? 'dark-mode' : ''}`}>
        <HomepageTopSection/>
      </div>

        {/* use different react components for forms in homepage and navbar in order to seperate concerns and avoid state/post logic clashing */}
        <SubmitPostForm
          currentUser={currentUser}
          location="homepage"
        />
        <AllPostsDisplay/> 
    </div>
    </>
  )
}

export default Home
