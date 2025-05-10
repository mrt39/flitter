//adebug component for testing cache functionality
 
//USAGE: de-comment the button component in App.jsx and click to run the tests.

import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import { 
  diagnoseCacheHealth,
  testSinglePostCache,
  testCacheInvalidation,
  testLikeUpdateInCache,
  testCrossTabSync,
  runAllCacheTests
} from '../utilities/cacheTestUtils';
import { useAuth } from '../contexts/AuthContext';

function CacheTestButton() {
  //state for controlling the visibility of the dialog
  const [open, setOpen] = useState(false);
  //state for storing test results to display in the dialog
  const [results, setResults] = useState(null);
  //get current user from auth context to pass userId to tests
  const { currentUser } = useAuth();
  
  //function that runs when the test button is clicked
  async function handleRunTests() {
    //log the test start to console
    console.log("Running cache tests...");
    try {
      //attempt to find a post ID from the DOM by looking for data-post-id attribute
      //this allows testing with an actual post from the current view
      let postId = null;
      try {
        //query the DOM for any element with a data-post-id attribute
        const postElement = document.querySelector('[data-post-id]');
        if (postElement) {
          //extract the post ID if found
          postId = postElement.getAttribute('data-post-id');
        }
      } catch (e) {
        //log any errors that occur when trying to find a post ID
        console.error("Couldn't find post ID", e);
      }
      
      //show the dialog to indicate tests are running
      setOpen(true);
      //update dialog content to show tests are in progress
      setResults("Running tests...");
      
      //run all cache tests with the found postId and current user's ID
      const results = await runAllCacheTests(
        postId, 
        currentUser?._id
      );
      
      //update dialog content after tests complete
      setResults("Tests completed! Check browser console for detailed results.");
      
    } catch (error) {
      //handle any errors that occur during testing
      console.error("Test error:", error);
      //display error message in the dialog
      setResults(`Error running tests: ${error.message}`);
    }
  }
  
    return (
        <>
        {/* test button with fixed position at bottom right */}
        <Button
            variant="contained"
            onClick={handleRunTests}
            sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999, 
            backgroundColor: '#ff5722', 
            color: 'white',
            fontWeight: 'bold',
            '&:hover': {
                backgroundColor: '#e64a19' 
            }
            }}
        >
            Test Cache
        </Button>
        
        {/* dialog to show test results */}
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Cache Test Results</DialogTitle>
            <DialogContent>
            <Typography>{results}</Typography>
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        </>
    );

}

export default CacheTestButton;