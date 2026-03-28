const User = require("../models/User"); // Adjust path as needed



module.exports = {
    
ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

}