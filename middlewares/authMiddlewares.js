'use strict';

const isLoggedIn = (req, res, next) => {
  if (req.session.currentUser) {
    return res.redirect('/'); // WHAT ARE WE PROTECTING THE ROUTE FROM???
  }
  next();
};

const isNotLoggedIn = (req, res, next) => {
  if (!req.session.currentUser) {
    return res.redirect('/');
  }
  next();
};

const isFormFilled = (req, res, next) => {
  const { username, password } = req.body; // could be inside try or outside is OK too.
  if (!username || !password) {
    return res.redirect(req.path); // inner protection: if there's no password OR no username, redirect BACK to signup (same page) - because frontend validation isn't enough
  }// why the req.path??
  next();
};

module.exports = { // exporting FUNCTIONS to have access to them from elsewhere
  isLoggedIn,
  isNotLoggedIn,
  isFormFilled
};
