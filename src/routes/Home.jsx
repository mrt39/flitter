/* eslint-disable react/prop-types */
import '../styles/Home.css'
import {useContext } from 'react'
import AllPostsDisplay from '../components/AllPostsDisplay.jsx';
import { UserContext } from '../App.jsx';
import SubmitPostForm from '../components/SubmitPostForm.jsx';
import { AppStatesContext } from '../App.jsx';





function Home() {

  //Pass the UserContext defined in app.jsx
  const { currentUser } = useContext(UserContext); 
  const { darkModeOn} = useContext(AppStatesContext); 


  return (
    <>
    <div className='homeContainer'>
      <div className={`homePageTopContainer ${darkModeOn ? 'dark-mode' : ''}`}>
        <h1>
          THIS IS HOMEPAGE
        </h1>
      </div>

      {/* use different react components for forms in homepage and navbar in order to seperate concerns and avoid state/post logic clashing */}
      <SubmitPostForm
       currentUser={currentUser}
       location="homepage"
      />
      <AllPostsDisplay
      />
    </div>
    </>
  )
}

export default Home
