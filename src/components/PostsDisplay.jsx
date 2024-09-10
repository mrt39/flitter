/* eslint-disable react/prop-types */
import { useContext } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import CommentForm from "../components/CommentForm.jsx";
import CommentsDisplay from "../components/CommentsDisplay.jsx";
import { UserContext } from '../App.jsx';
//imports for generating the url path for routing 
import slugify from 'slugify';



const PostsDisplay = ({fromThisUser}) => {


  const [snackbarOpenCondition, setSnackbarOpenCondition, snackbarOpen, setSnackbarOpen, setCurrentUser, profileUpdated, setProfileUpdated, allPosts, setAllPosts, handleLike, pressedLikePost, imgSubmitted, setImgSubmitted, pressedSubmitPost, setPressedSubmitPost, clickedPostComment, setClickedPostComment ] = useOutletContext();

  //Pass the UserContext defined in app.jsx
  const { currentUser, selectedUser, setSelectedUser } = useContext(UserContext); 


  const navigate = useNavigate(); 

  //handle generating the url path for routing to /profile/:slug
  function handleProfileRouting(clickedOnUser){
    setSelectedUser(clickedOnUser)
    //slugify the username, e.g:"john-doe"
    const slug = slugify(clickedOnUser.name, { lower: true }); 
    //combine slug with usershortID to create the unique profile path for the selected user to route to
    const profilePath = `/profile/${slug}-${clickedOnUser.shortId}`
    // Route to the profile path
    navigate(profilePath); 
  }


  return (
    <ul>
      {allPosts && allPosts.length > 0 ? (
        allPosts.map((post) => (
          // If fromThisUser exists, only display posts from that user
          fromThisUser ? (
            post.from[0]._id === fromThisUser._id && (
              <li key={post._id}>
                <Link onClick={() => handleProfileRouting(post.from[0])}>
                  <h3>{post.from[0].name}</h3>
                </Link>

                {post.message && (
                  <p>{post.message}</p>
                )}

                {post.image && (
                  <p>
                    <img className="msgBoxImg1" src={post.image} alt="image" />
                  </p>
                )}

                <p>{dayjs(new Date(post.date)).format('MMM D, H:mm')}</p>
                <button onClick={() => handleLike(post._id)}>Like Post</button>
                <p>Likes: {post.likeCount}</p>

                <CommentForm postID={post._id} 
                  clickedPostComment={clickedPostComment} 
                  setClickedPostComment={setClickedPostComment} 
                />
                <p>Comments: {post.commentCount}</p>

                <br />

                <CommentsDisplay post={post} />

                <br /> <br /> <br />
              </li>
            )
          ) : (
            // If fromThisUser does not exist, display all posts
            <li key={post._id}>
              <Link onClick={() => handleProfileRouting(post.from[0])}>
                <h3>{post.from[0].name}</h3>
              </Link>

              {post.message && (
                <p>{post.message}</p>
              )}

              {post.image && (
                <p>
                  <img className="msgBoxImg1" src={post.image} alt="image" />
                </p>
              )}

              <p>{dayjs(new Date(post.date)).format('MMM D, H:mm')}</p>
              <button onClick={() => handleLike(post._id)}>Like Post</button>
              <p>Likes: {post.likeCount}</p>

              <CommentForm 
              postID={post._id} 
              clickedPostComment={clickedPostComment} 
              setClickedPostComment={setClickedPostComment} 
              />
              <p>Comments: {post.commentCount}</p>

              <br />

              <CommentsDisplay post={post} />

              <br /> <br /> <br />
            </li>
          )
        ))
      ) : (
        <p>No posts available</p>
      )}
    </ul>
  
  );
};


export default PostsDisplay;

