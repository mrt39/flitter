import { useState, useEffect, useContext } from 'react';
import '../styles/Home.css'
import { UserContext } from '../App.jsx';
import { clean } from 'profanity-cleaner';
import dayjs from 'dayjs';




function Home() {

  //Pass the UserContext defined in app.jsx
  const { currentUser, selectedPerson, setSelectedPerson } = useContext(UserContext); 

  const [pressedSubmitPost, setPressedSubmitPost] = useState(false)
  const [value, setValue] = useState()
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











  //useeffect to handle sending comments on blog posts
  useEffect(() => {
    async function submitPost() {
      //on submit, clean the words with the profanity cleaner package
      //https://www.npmjs.com/package/profanity-cleaner
      let filteredPostMessage = await clean(value, { keepFirstAndLastChar: true, placeholder: '#' }) 

      await fetch(import.meta.env.VITE_BACKEND_URL+'/submitPost', {
        method: "post",
        // storing date as isostring to make the reading easier later
        body: JSON.stringify({ from: currentUser, date: new Date().toISOString(), message: filteredPostMessage}), 
        headers: {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
        },
        credentials:"include" //required for sending the cookie data
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
            <p>{dayjs(new Date(post.date)).format('MMM D, H:mm ')}</p>
            <p>Likes: {post.likeCount}</p>
            <p>Comments: {post.commentCount}</p>
            <br /> <br /> <br />
        </li>
        ))}
      </ul>


    </div>
    </>
  )
}

export default Home
