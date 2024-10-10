/* eslint-disable react/prop-types */
import { useState, useContext } from 'react';
import { AppStatesContext } from '../App.jsx';
import '../styles/HomepageTopSection.css';

const HomepageTopSection = ({activeTab, setActiveTab}) => {

  const { darkModeOn} = useContext(AppStatesContext); 


  return (
    <div className="homepageTopSection-container">
      <div className="tabs">
        <div
          className={`tab forYou ${darkModeOn ? 'dark-mode' : ''} ${activeTab === 'forYou' ? 'active' : ''}`}
          onClick={() => setActiveTab('forYou')}
        >
            <div className='topsection-text-and-underline-container'>
                <span>For you</span>
                {activeTab === 'forYou' && <div className="underline"></div>}
            </div>
        </div>
        <div
          className={`tab ${darkModeOn ? 'dark-mode' : ''} ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
            <div className='topsection-text-and-underline-container'>
                <span>Following</span>
                {activeTab === 'following' && <div className="underline"></div>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageTopSection;