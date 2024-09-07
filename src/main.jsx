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




const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <App />,
     children: [
      { index: true, element: <Home/> }, 
      { path: "login", element: <Login />},
      { path: "signup", element: <SignUp />},
      { path: "profile/:slugID", element: <Profile /> },
      { path: "profileedit", element: <ProfileEdit />},
    ], 
  },

]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

