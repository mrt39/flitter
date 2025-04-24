/* eslint-disable react/prop-types */
import '../styles/Home.css'
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUI } from '../contexts/UIContext.jsx';
import SubmitPostForm from '../components/SubmitPostForm.jsx';
import AllPostsDisplay from '../components/AllPostsDisplay.jsx';
import HomepageTopSection from '../components/HomepageTopSection.jsx';

function Home() {
  //use context hooks
  const { currentUser } = useAuth(); 
  const { darkModeOn } = useUI(); 

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