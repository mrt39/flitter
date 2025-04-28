/* eslint-disable react/prop-types */

//ui context for managing ui state like dark mode, snackbars, and container refs
import { createContext, useState, useContext} from 'react';
import { createAppTheme } from '../utilities/themeUtils';

const UIContext = createContext();

function UIProvider({ children, appContainerRef }) {
  //load the theme from localstorage so that the user selection persists. Use dark theme as default.
  const savedTheme = localStorage.getItem('darkModeOn') || 'true';

  //parse saved theme value as a boolean. Default to true (dark mode) if no value is found.
  const [darkModeOn, setDarkModeOn] = useState(savedTheme === 'true');

  //snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarOpenCondition, setSnackbarOpenCondition] = useState("");


  //function to toggle the dark mode
  function toggleDarkTheme() {
    setDarkModeOn(prevDarkModeOn => {
      const newTheme = !prevDarkModeOn;
      localStorage.setItem('darkModeOn', newTheme); //store new value in localStorage
      return newTheme;
    });
  }

  //create MUI theme object based on dark mode setting
  const theme = createAppTheme(darkModeOn);

  const value = {
    darkModeOn,
    toggleDarkTheme,
    snackbarOpen,
    setSnackbarOpen,
    snackbarOpenCondition,
    setSnackbarOpenCondition,
    appContainerRef,
    theme
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

function useUI() {
  return useContext(UIContext);
}

export { UIProvider, useUI };