/* eslint-disable react/prop-types */
import {useContext, useEffect, useState } from 'react';
import { AppStatesContext, UserContext } from '../App.jsx';
import { Box, CircularProgress, Card, CardContent, Typography, List, ListItem, ListItemText} from '@mui/material';

import '../styles/WhatsHappening.css';





const WhatsHappening = () => {

  const {allPosts, mostIteratedWords, setActiveTab, setMostIteratedWords, darkModeOn, setSearchWord} = useContext(AppStatesContext); 
  const {currentUser} = useContext(UserContext); 


  const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (allPosts.length === 0) {
            return;
        }
        //find the three words that are the most iterated in the posts and the number of times they are iterated
        let words = []; //structure: {word: word, timesIterated: number of times iterated} 
        allPosts.forEach(post => {
            post.message.split(' ').forEach(wordinallPosts => {
                let wordFound = false;
                words.forEach(word => {
                    if (word.word === wordinallPosts) {
                        word.timesIterated++;
                        wordFound = true;
                    }
                });
                if (!wordFound) {
                    words.push({ word: wordinallPosts, timesIterated: 1 });
                }
            });
        });
        //sort the words by the number of times they are iterated
        words.sort((a, b) => b.timesIterated - a.timesIterated);
        //exclude the filler words like "the", "to", "and", "1", "is", "I", "2", "of", "3", "what", "that", "your", "not", "in", "a", "have", "be", "we", "will", "do", "can" , "but", "it", "if", "You" from the list of most iterated words
        words = words.filter(word => word.word.toLowerCase() !== "the" && word.word !== "to" && word.word !== "and" 
            && word.word !== "1" && word.word !== "is" && word.word !== "I" && word.word !== "2" 
            && word.word !== "of" && word.word !== "3" && word.word !== "what" && word.word !== "that" 
            && word.word !== "your" && word.word !== "not" && word.word !== "in" && word.word !== "a"
            && word.word !== "have" && word.word !== "be"  && word.word !== ""  && word.word !== "we" 
            && word.word !== "will" && word.word !== "do" && word.word !== "with" && word.word !== "for"
            && word.word !== "can" && word.word !== "on" && word.word !== "are" && word.word !== "this"
            && word.word !== "but" && word.word !== "my" && word.word !== "at" && word.word !== "from"
            && word.word !== "it" && word.word !== "by" && word.word !== "as" && word.word !== "or"
            && word.word.toLowerCase() !== "if" && word.word !== "so" && word.word !== "an" 
            && word.word !== "all" && word.word !== "You" && word.word !== "about" && word.word !== "more");
        //get the three most iterated words
        setMostIteratedWords(words.slice(0, 3));
        setLoading(false);
    }, [allPosts]); 

    
    //set the search word to the word clicked on
    function sortSearchWord(word) {
        //set the active tab to "forYou" when a word is clicked on, so that it displays the posts from everyone that contains the word
        setActiveTab('forYou')
        setSearchWord(word);
    }

    if (loading) {
        return (
        <div className='circularProgressContainer'>
            <Box sx={{ display: 'flex' }}>
            <CircularProgress size="5rem" />
            </Box>
        </div>
        )
    }


    return (
        <Card className="sidebarRight-section-card">
            <CardContent>
            <Typography variant="h6" component="div" className='sidebarRightTitle'>
                What&apos;s happening
            </Typography>
            <List>
                {mostIteratedWords.map((word, index) => (
                <ListItem key={index}>
                    <span className={`whatsHappening-listitem ${darkModeOn && 'dark-mode'}`} onClick={() => sortSearchWord(word.word)}>
                        <ListItemText
                            primary={
                            <>
                                <Typography
                                variant="body2"
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 400,
                                    color: darkModeOn ? 'rgb(113, 118, 123)' : 'rgb(83, 100, 113)',
                                }}
                                >
                                Trending
                                </Typography>
                                <Typography
                                variant="h6"
                                style={{
                                    fontSize: '15px',
                                    fontWeight: 700,
                                }}
                                >
                                {word.word}
                                </Typography>
                                <Typography
                                variant="body2"
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 400,
                                    color: darkModeOn ? 'rgb(113, 118, 123)' : 'rgb(83, 100, 113)',
                                }}
                                >
                                {`${word.timesIterated} posts`}
                                </Typography>
                            </>
                            }
                        />
                    </span>
                </ListItem>
                )) }
            </List>
            </CardContent>
        </Card>

    );
}

export default WhatsHappening

