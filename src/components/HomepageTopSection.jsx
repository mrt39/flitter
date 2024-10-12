/* eslint-disable react/prop-types */
import { useContext } from 'react';
import { AppStatesContext } from '../App.jsx';
import '../styles/HomepageTopSection.css';
import { Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const HomepageTopSection = () => {

  const { darkModeOn, activeTab, setActiveTab, mostIteratedWords, searchWord, setSearchWord} = useContext(AppStatesContext); 


  return (
    <>
    {// if there is a search word, display a panel on top that shows the search word, and a back button to go back to remove the search word
    searchWord ? 
    (
      <div className="top-header">
        <div className="top-header-backButton">
            <IconButton onClick={() => {setActiveTab('forYou'); setSearchWord(null);}} className="back-button">
                <ArrowBackIcon />
            </IconButton>
        </div>
        <div className="top-header-text">
            <Typography variant="h5" component="div" fontWeight="bold" className="username">
                      Trending: {searchWord}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="header-postCount">
                {/* find the searchword in the mostIteratedWords array and display the number of posts that contain the search word */}
                {mostIteratedWords.find(word => word.word === searchWord).timesIterated} posts
            </Typography>    
        </div>  
    </div>
    ) :
    // if there is no search word, display the tabs for "For you" and "Following"
    <div className="homepageTopSection-container">
      <div className="tabs">
        <div
          className={`tab forYou ${darkModeOn ? 'dark-mode' : ''} ${activeTab === 'forYou' ? 'active' : ''}`}
          onClick={() => {setActiveTab('forYou'); setSearchWord(null);}}
        >
            <div className='topsection-text-and-underline-container'>
                <span>For you</span>
                {activeTab === 'forYou' && <div className="underline"></div>}
            </div>
        </div>
        <div
          className={`tab ${darkModeOn ? 'dark-mode' : ''} ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => {setActiveTab('following'); setSearchWord(null); }}
        >
            <div className='topsection-text-and-underline-container'>
                <span>Following</span>
                {activeTab === 'following' && <div className="underline"></div>}
            </div>
        </div>
      </div>
    </div>
    }
    </>
  );
};

export default HomepageTopSection;