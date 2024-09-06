import { useState, useEffect, useContext } from 'react';
import '../styles/Home.css'
import CommentForm from "../components/CommentForm.jsx";
import { UserContext } from '../App.jsx';
import { clean } from 'profanity-cleaner';
import dayjs from 'dayjs';
import { CircularProgress, Alert } from '@mui/material';




function Home() {

  //Pass the UserContext defined in app.jsx
  const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

  const [pressedSubmitPost, setPressedSubmitPost] = useState(false)
  const [value, setValue] = useState()
  const [likepostID, setLikePostID] = useState("")
  const [pressedLikePost, setPressedLikePost] = useState(false)
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  function handleChange(event){
    setValue(event.target.value)
  }

  function handleSubmit(event){
    event.preventDefault();
    setPressedSubmitPost(true);
  }


  function handleLike(postID){
    setLikePostID(postID)
    /* setPressedLikePost(true) */
    sortDate()
  }



  //useffect for liking posts
    useEffect(() => {
      async function likePost() {
        await fetch(import.meta.env.VITE_BACKEND_URL+'/likePost', {
          method: "PATCH",
          // storing date as isostring to make the reading easier later
          body: JSON.stringify({ postID: likepostID, likedBy: currentUser}), 
          headers: {
              'Content-Type': 'application/json',
              "Access-Control-Allow-Origin": "*",
          },
          credentials:"include" //required for sending the cookie data-authorization check
      })
        .then(async result => {
          if (result.ok){
            await result.json();
            console.log("Liked Post!")
            setPressedLikePost(false)
          } else{
            throw new Error(result)
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setPressedLikePost(false)
        }); 
      }
      //only trigger when comment is posted
      if (pressedLikePost ===true){
        likePost();
      } 
    }, [pressedLikePost]);






  //fetch for getting data of all posts
  useEffect(() => {
    const getMessages = () => {
      fetch(import.meta.env.VITE_BACKEND_URL+'/getallposts', {
      method: 'GET',
      })
      .then(response => {
          if (response.ok) {
          return response.json(); // Parse JSON when the response is successful
          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          //sort data by dates, descending order
          data.sort((post1,post2) => (post1.date < post2.date) ? 1 : ((post2.date < post1.date) ? -1 : 0))
          console.log(data)
          setAllPosts(data)
          setLoading(false)
      })
      .catch(error => {
          setError(error.message);
          console.error('Error:', error);
          setLoading(false)
      });
    };
    getMessages();
    }, []); 


  //useeffect to handle submitting blog posts
  useEffect(() => {
    async function submitPost() {
      //on submit, clean the words with the profanity cleaner package
      //https://www.npmjs.com/package/profanity-cleaner
      let filteredPostMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' }) 

      await fetch(import.meta.env.VITE_BACKEND_URL+'/submitPost', {
        method: "post",
        // store date as isostring to make the reading easier later
        body: JSON.stringify({ from: currentUser, date: new Date().toISOString(), message: filteredPostMessage}), 
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
        credentials:"include" //required for sending the cookie data-authorization check
    })
      .then(async result => {
        if (result.ok){
          await result.json();
          console.log("Posted Succesfully!")
          setPressedSubmitPost(false)
        } else{
          throw new Error(result)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setPressedSubmitPost(false)
      }); 
    }
    //only trigger when comment is posted
    if (pressedSubmitPost ===true){
      submitPost();
    } 
  }, [pressedSubmitPost]);



  if (loading) {
    return <CircularProgress />;
  }



  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }




  return (
    <>
    <div className='homeContainer'>

      <h1>
       THIS IS HOMEPAGE
      </h1>



      <form onSubmit={handleSubmit}>
        <label>
          Send a Post:
          <textarea value={value} onChange={handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>

      <ul>
      {allPosts.map((post) => (
        <li key={post._id}>
            <h3>{post.from[0].name}</h3>
            <p>{post.message}</p>
            <p>{dayjs(new Date(post.date)).format('MMM D, H:mm')}</p>
            {/* <p>{dayjs(post.date).format('MMMM D, YYYY h:mm A')}</p> */}
            <button onClick={()=>handleLike(post._id)}>Like Post</button>
            <p>Likes: {post.likeCount}</p>
            <CommentForm 
             postID={post._id}
            />
            <p>Comments: {post.commentCount}</p>
            <br />
            <p>Comment Section of This post:</p>
            <ul>
              {/* if exists, post the comments of this post */}
            {post.comments ?
            post.comments.map((comment) => (
            <li key={comment.id}>
              <p>{comment.comment}</p>
              <p>{comment.date}</p>
              <h4>{comment.from[0].name}</h4>
            </li>
            ))
            :""}
            </ul>
            <br /> <br /> <br />
        </li>
        ))}
      </ul>


    </div>
    </>
  )
}

export default Home
