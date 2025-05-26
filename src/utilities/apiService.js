//central utility for making fetch requests with consistent error handling and authentication

//base fetch wrapper with auth credentials
function fetchWithAuth(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
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
    .then(async response => {
      if (!response.ok) {
        //get specific error details from response
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || 'Network response was not ok');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      return response.json();
    })
    .catch(error => {
      console.error('API request failed:', error);
      throw error;
    });
}

export { fetchWithAuth };