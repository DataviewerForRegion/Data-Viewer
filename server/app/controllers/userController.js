/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file User controller
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
const bcrypt = require('bcryptjs');
const models = require('../models');

module.exports.create = (req, res) => {
  const {
    username,
    password,
    password2,
    firstName,
    lastName,
    email,
  } = req.body;

  if (!username || !password || !password2) {
    req.session.sessionFlash = {
      type: 'error',
      message: 'Please fill in all the fields!',
    };
    res.redirect('adduser');
  }

  if (password !== password2) {
    req.session.sessionFlash = {
      type: 'error',
      message: 'Please enter the same password twice!',
    };
    res.redirect('adduser');
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = {
    username,
    email,
    firstName,
    lastName,
    salt,
    password: hashedPassword,
  };
  models.User.create(newUser).then(() => {
    res.redirect('/admin/users');
  });
};

module.exports.update = (req) => {
  const user = req.body.user;
  let salt;
  const updateFields = [];
  if (user.password) {
    salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, salt);
    updateFields.push('salt');
  }
  Object.keys(user).forEach((key) => {
    updateFields.push(key);
  });
  return req.user.update({
    first_name: user.first_name,
    last_name: user.last_name,
    password: user.password,
    salt,
    email: user.email,
  }, {
    fields: updateFields,
  });
};

