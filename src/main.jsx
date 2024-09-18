import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx';
import ErrorPage from "./routes/Error-Page.jsx";
import Login from './routes/Login.jsx';
import SignUp from './routes/SignUp.jsx';
import Home from './routes/Home.jsx';
import Profile from './routes/Profile.jsx';
import ProfileEdit from './routes/ProfileEdit.jsx';
import Followers from './routes/Followers.jsx';
import SingularPostPage from './routes/SingularPostPage.jsx';





const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
     children: [
      { index: true, element: <Home/> }, 
      { path: "login", element: <Login />},
      { path: "signup", element: <SignUp />},
      { path: "profile/:slugID", 
        element: <Profile /> ,
/*         children: [
          { path: "following", element: <Followers />},
          { path: "followedby", element: <Followers />},
        ] */
      },
      { path: "profile/:slugID/following", element: <Followers />},
      { path: "profile/:slugID/followers", element: <Followers />},
      { path: "profileedit", element: <ProfileEdit />},
      { path: "post/:postID", element: <SingularPostPage />},
    ], 
  },

]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

