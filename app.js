'use strict';

// npm install mongoose

// --

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const hbs = require('hbs');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session); // what's going on here?

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();

// --

mongoose.connect('mongodb://localhost/expressAuthentication', {
  keepAlive: true,
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE
});

app.use(session({ // if there's no cookie, it adds a cookie to the response
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day - lifespan of a session
  }),
  secret: 'some-string', // don't push to github! a secret! - session will check if it corresponds to some id.
  resave: true, // if you have a saved session for a longer period, the computer closes it.
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // restricts the cookie object to a string
    maxAge: 24 * 60 * 60 * 1000 // 1 day - lifespan of a cookie
  }
}));

// Makes the currentUser available in every page
// note1: currentUser needs to match whatever you use in login/signup/logout routes
// note2: if using passport, req.user instead
app.use((req, res, next) => {
  app.locals.currentUser = req.session.currentUser; // Got lost, what happens here?
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// -- 404 and error handler

// NOTE: requires a views/not-found.ejs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found');
});

// NOTE: requires a views/error.ejs template
app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('error');
  }
});

module.exports = app;
