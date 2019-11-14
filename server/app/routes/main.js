/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Main route definitions
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
const express = require('express');
const passport = require('passport');
const sequelize = require('sequelize');
const datasetController = require('../controllers/datasetController');

const router = express.Router();

// Route to get all datasets
router.get('/datasets', (req, res) => {
  datasetController.getActiveDatasets(req)
    .then((datasets) => {
      const datasetArray = datasets.map(dataset => dataset.get({ plain: true }));
      res.json(datasetArray);
    });
});

router.get('/datasets/c', (req, res) => {
  datasetController.getDatasetCount(req)
    .then(num => res.json({ count: num }));
});

router.get('/authstatus', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ auth: req.isAuthenticated() }));
});

// Login route
router.post('/login', passport.authenticate('local', {}), (req, res) => {
  res.json({ loggedIn: true, username: req.user.username });
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ loggedIn: false, username: 'anonymous' });
});

// Get file of dataset with given id and filetype
router.get('/dataset/:dataset_id/filetype/:filetype', (req, res) => {
  const id = +req.params.dataset_id;
  const { filetype } = req.params;
  datasetController.getFile(id, filetype)
    .then(filePath =>
      res.sendFile(filePath, { headers: { 'Content-Type': 'application/json' } }))
  // Send 404 if resource not found
    .catch(sequelize.EmptyResultError, () =>
      res.sendStatus(404))
    .catch(error =>
      console.error(error));
});
// Get dataset metadata
router.get('/dataset/:dataset_id/meta', (req, res) => {
  datasetController.getMetadata(+req.params.dataset_id)
    .then(result => res.json(result.get({ plain: true })))
  // Send 404 if resource not found
    .catch(sequelize.EmptyResultError, () =>
      res.sendStatus(404));
});

module.exports = router;
