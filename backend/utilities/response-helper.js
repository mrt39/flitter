//helper functions for standardizing API responses

//success response with data
function successResponse(res, data, statusCode = 200, message = null) {
    const response = {
      success: true
    };
    
    if (data) {
      response.data = data;
    }
    
    if (message) {
      response.message = message;
    }
    
    return res.status(statusCode).json(response);
  }
  
  //success response with only message
  function messageResponse(res, message, statusCode = 200) {
    return res.status(statusCode).json(message);
  }
  
  module.exports = {
    successResponse,
    messageResponse
  };