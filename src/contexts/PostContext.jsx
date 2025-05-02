/* eslint-disable react/prop-types */

//post context for managing post data, submissions, and interactions
import { createContext, useState, useContext, useEffect } from 'react';
import { getAllPosts } from '../utilities/postService';

const PostContext = createContext();

function PostProvider({ children }) {
  //all posts
  const [allPosts, setAllPosts] = useState([]);
  
  //refresh posts in the event of like, comment or sending a new post
  const [refreshPosts, setRefreshPosts] = useState(false);
  
  //post submission states
  const [imgSubmittedNavbar, setImgSubmittedNavbar] = useState(false);
  const [imgSubmittedHomePage, setImgSubmittedHomePage] = useState(false);
  const [pressedSubmitPost, setPressedSubmitPost] = useState(false);
  const [isSubmittingPost, setisSubmittingPost] = useState(false);
  
  //active tab in the HomePageTopSection component
  const [activeTab, setActiveTab] = useState('forYou');
  
  //state for most iterated words in the posts and search
  const [mostIteratedWords, setMostIteratedWords] = useState(null);
  const [searchWord, setSearchWord] = useState(null);

  //fetch posts when refreshPosts changes
  useEffect(() => {
    if (allPosts.length === 0 || refreshPosts) {
      getAllPosts()
        .then(data => {
          setAllPosts(data);
          if (refreshPosts) setRefreshPosts(false);
        })
        .catch(error => {
          console.error('Error fetching posts:', error);
        });
    }
  }, [refreshPosts]);

  //calculate most iterated words when posts change to display in what's happening component
  useEffect(() => {
    if (allPosts.length === 0) return;

    //find the three words that are the most iterated in the posts and the number of times they are iterated
    let words = [];
    allPosts.forEach(post => {
      //if there is no text in the post (if it is an image), return
      if (!post.message) return;

      //split post into words
      const allWordsInPost = post.message.split(' ');
      
      //create array for unique words
      const uniqueWordsInPost = [];
  
      //get only the unique words from this post 
      //(so if there is a word repeated multiple times in the same post, it will count as only one, as we are looing for "posts" that contain these words, so counting the posts)
      for (let i = 0; i < allWordsInPost.length; i++) {
        //convert to lowercase and remove punctuation for accurate counting
        const wordLowerCase = allWordsInPost[i].toLowerCase().replace(/[.,;:!?'"()]/g, '');
        //skip empty words
        if (wordLowerCase === '') continue;
        
        //check if word is already in unique list
        let isWordAlreadyAdded = false;
        for (let j = 0; j < uniqueWordsInPost.length; j++) {
          if (uniqueWordsInPost[j] === wordLowerCase) {
            isWordAlreadyAdded = true;
            break;
          }
        }

        //if word isn't in the list yet, add it
        if (!isWordAlreadyAdded) {
          uniqueWordsInPost.push(wordLowerCase);
        }
      }
      
      uniqueWordsInPost.forEach(wordInPosts => {
        let wordFound = false;
        words.forEach(word => {
          if (word.word=== wordInPosts) {
            word.timesIterated++;
            wordFound = true;
          }
        });
        if (!wordFound) {
          words.push({ word: wordInPosts, timesIterated: 1 });
        }
      });
    });
    
    //sort the words by the number of times they are iterated
    words.sort((a, b) => b.timesIterated - a.timesIterated);
    //exclude the filler words like "the", "to", "and", "1", "is", "I", "2", "of", "3", "what", "that", "your", "not", "in", "a", "have", "be", "we", "will", "do", "can" , "but", "it", "if", "You" from the list of most iterated words
    words = words.filter(word => 
      !['the', 'to', 'and', '1', 'is', 'I', 'i', '', '2', 'of', '3', 'what', 'that', 
       'your', 'not', 'in', 'a', 'have', 'be', 'we', 'will', 'do', 'can', 
       'but', 'it', 'if', 'You', 'with', 'for', 'on', 'are', 'this', 'my', 
       'at', 'from', 'by', 'as', 'or', 'so', 'an', 'all', 'about', 'more']
        .includes(word.word.toLowerCase()));
    //get the three most iterated words
    setMostIteratedWords(words.slice(0, 3));
  }, [allPosts]);

  const value = {
    allPosts,
    setAllPosts,
    refreshPosts,
    setRefreshPosts,
    imgSubmittedNavbar,
    setImgSubmittedNavbar,
    imgSubmittedHomePage,
    setImgSubmittedHomePage,
    pressedSubmitPost,
    setPressedSubmitPost,
    isSubmittingPost,
    setisSubmittingPost,
    activeTab,
    setActiveTab,
    mostIteratedWords,
    setMostIteratedWords,
    searchWord,
    setSearchWord
  };

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
}

function usePost() {
  return useContext(PostContext);
}

export { PostProvider, usePost };