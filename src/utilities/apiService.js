//central utility for making fetch requests with consistent error handling and authentication

//base fetch wrapper with auth credentials
function fetchWithAuth(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
    },
    credentials: "include"
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  return fetch(`${import.meta.env.VITE_BACKEND_URL}${url}`, mergedOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .catch(error => {
      console.error('API request failed:', error);
      throw error;
    });
}

export { fetchWithAuth };