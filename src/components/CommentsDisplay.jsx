/* eslint-disable react/prop-types */

const CommentsDisplay = ({post}) => {


  return (
    <>
        <p>Comment Section of This post:</p>
        <ul>
        {/* if exists, post the comments of this post */}
        {post.comments ?
        post.comments.map((comment) => (
        <li key={comment._id}>
        <p>{comment.comment}</p>
        <p>{comment.date}</p>
        <h4>{comment.from[0].name}</h4>
        </li>
        ))
        :""}
        </ul>
    </>
  );
};

export default CommentsDisplay;