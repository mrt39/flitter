//authentication middleware functions
const passport = require('passport');

//check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json('Not authenticated!');
}

//handle authentication success
function handleAuthSuccess(req, res) {
  if (req.isAuthenticated()) {
    res.redirect(process.env.CLIENT_URL);
  } else {
    res.status(401).send(JSON.stringify("Authentication failed"));
  }
}

module.exports = { 
  isAuthenticated,
  handleAuthSuccess
};