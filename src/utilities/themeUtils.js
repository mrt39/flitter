//dark mode utilities
import { createTheme } from '@mui/material/styles';

//get css class with dark mode applied if needed
function getDarkModeClass(baseClass, darkModeOn) {
  return `${baseClass} ${darkModeOn ? 'dark-mode' : ''}`;
}

//create mui theme based on dark mode setting
function createAppTheme(darkModeOn) {
  return createTheme({
    palette: {
      mode: darkModeOn ? 'dark' : 'light', 
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#131052',
      },
      background: {
        default: darkModeOn ? 'black' : '#fff',
      },
      text: {
        primary: darkModeOn ? 'rgb(231, 233, 234)' : 'rgb(15, 20, 25)',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: darkModeOn ? '#333' : '#ddd',
            },
          },
        },
      },
    },
  });
}

export { getDarkModeClass, createAppTheme };