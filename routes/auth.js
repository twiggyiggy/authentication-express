'use strict';

const express = require('express');

// npm install bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const User = require('../models/User.js'); // accesses User.js in which we have access  to the mongoose methods
const { isLoggedIn, isNotLoggedIn, isFormFilled } = require('../middlewares/authMiddlewares');

const router = express.Router();

/* GET home page. */
router.get('/signup', isLoggedIn, (req, res, next) => { // renders/sends the information(form) to the user
  res.render('signup');
});

router.post('/signup', isLoggedIn, isFormFilled, async (req, res, next) => { // takes user's info and saves it in the database
  try {
    const { username, password } = req.body; // here, we take user's input - HTTP message's body - destructuring objects hbs
    const salt = bcrypt.genSaltSync(saltRounds); // creates a random string before the password
    const hashedPassword = bcrypt.hashSync(password, salt); // encrypts the password, assigns to variable

    const user = await User.findOne({ username }); // check if a created username already exists
    if (user) {
      return res.redirect('/auth/signup');
    }
    const newUser = await User.create({
      username,
      password: hashedPassword
    });
    req.session.currentUser = newUser; // what happens here? // we're creating the currentUser property for the first time. Sessions is an object created by the express-sessions package
    res.redirect('/'); // resolving POST messages with redirect // with a GET - res.render.
  } catch (error) {
    next(error);
  }
});

router.get('/login', isLoggedIn, (req, res, next) => { // what's going on here?
  res.render('login');
});

router.post('/login', isLoggedIn, isFormFilled, async (req, res, next) => {
  const { username, password } = req.body; // could be inside try or outside is OK too.
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect('/auth/login'); // WHAT'S GOING ON HERE?
    }
    if (bcrypt.compareSync(password /* provided password */, user.password/* hashed password */)) { // compareSync is a bcrypt method
      // Save the login in the session!
      req.session.currentUser = user;
      res.redirect('/');
    } else {
      res.redirect('/auth/login');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/logout', isNotLoggedIn, (req, res, next) => {
  delete req.session.currentUser; // deletes the currentUser key/property
  res.redirect('/auth/login');
});

module.exports = router;

// User.create - create is a proper mongoose method that saves the data from the created model inside mongoDB's database
// req.body- formulario con metodo post
// req.query- formulatio con metodo get
// req.params- ?? => express!
// metodo is inside mongoose
// User refers to the model- like a class
// all mongoose methods are asynchronous
