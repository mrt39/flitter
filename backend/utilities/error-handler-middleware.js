//error handling middleware

//standard error response function
function errorResponse(res, error, statusCode = 500) {
    const errorMessage = error instanceof Error ? error.message : error;
    console.log("Error:", errorMessage);
    
    return res.status(statusCode).json({
      error: errorMessage
    });
  }
  
  //handle async errors in route handlers
  function asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(err => {
        return errorResponse(res, err);
      });
    };
  }
  
  module.exports = {
    errorResponse,
    asyncHandler
  };