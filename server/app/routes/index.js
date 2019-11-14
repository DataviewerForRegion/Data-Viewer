/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Entry point route
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
const express = require('express');

const router = express.Router();

// App entry point, render template with user authentication data
router.get('/', (req, res) => {
  const initialData = {};
  const user = {};
  user.loggedIn = false;
  // If the request is authenticated (cookie authentication), pass user data to template.
  if (req.isAuthenticated()) {
    user.username = req.user.username;
    user.loggedIn = true;
    user.isAdmin = req.user.isAdmin;
  }
  initialData.user = user;
  // Render main template with initial user data.
  res.render('main', { initData: JSON.stringify(initialData) });
});

module.exports = router;
