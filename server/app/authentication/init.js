/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Main configuration file for the back-end application
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const models = require('../models');

module.exports = function (app) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(((username, password, done) => {
    models.User.findOne({
      where: {
        username,
      },
    }).then((user) => {
      if (user == null) {
        return done(null, false, { message: 'Incorrect credentials.' });
      }

      const hashedPassword = bcrypt.hashSync(password, user.salt);

      if (user.password === hashedPassword) {
        return done(null, user);
      }

      return done(null, false, { message: 'Incorrect credentials.' });
    });
  })));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    models.User.findOne({
      where: {
        id,
      },
    }).then((user) => {
      if (user == null) {
        done(new Error('Wrong user id.'));
      }

      done(null, user);
    });
  });
};
