/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Admin route definitions
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
const models = require('../models');
const express = require('express');
const path = require('path');

const router = express.Router();
const del = require('del');

const Promise = require('bluebird');
const datasetController = require('../controllers/datasetController');
const userController = require('../controllers/userController');
const CustomErrors = require('../utils/errors.js');

const { UnableToOpenDatasourceError, WrongFileTypeError } = CustomErrors;

// Check if the request comes from an authenticated user, if it does,
// go to the next routes, else reply with 401 status(Forbidden)
router.use((req, res, next) => {
  if (req.isAuthenticated()) { return next(); }
  return res.status(401).end();
});

// GET route to display all datasets
router.get('/datasets', (req, res) => {
  datasetController.getDatasets(req)
    .then((datasets) => {
      res.json({ datasets });
    });
});
// GET route to get the count of all datasets
router.get('/datasets/c', (req, res) => {
  models.Dataset.count().then((count) => {
    res.json({ count });
  });
});
// GET route to get signed in user details
router.get('/user', (req, res) => {
  const user = {};
  const userData = req.user.get({ plain: true });
  ['id', 'username', 'email', 'first_name', 'last_name', 'createdAt', 'updatedAt'].forEach((field) => {
    user[field] = userData[field];
  });
  res.json(user);
});

router.put('/user', (req, res) => {
  userController.update(req)
    .then(() => {
      res.json({ status: 'done' });
    });
});

router.delete('/dataset/:id', (req, res) => {
  datasetController.deleteDataset(+req.params.id)
    .then((dataset) => {
      const response = { dataset: dataset.id, status: 'deleted' };
      res.json(response);
    });
});
// GET route to display detail information of one dataset according to dataset id
router.get('/dataset/:dataset_id', (req, res) => {
  // Get dataset with dataset_id
  models.Dataset.findOne({
    where: {
      id: req.params.dataset_id
    },
    include: [models.Attribute, models.File],
    order: [[models.Attribute, 'id', 'ASC'], [models.File, 'id', 'ASC']]
  // Render attributes in information overview
  }).then((data) => {
    const dataset = data.get({ plain: true });
    res.json({ dataset });
  });
});
router.get('/dataset/:dataset_id/edit', (req, res) => {
  // Get dataset with dataset_id
  models.Dataset.findAll({
    where: {
      id: req.params.dataset_id
    },
    include: [models.Attribute],
    order: [[models.Attribute, 'id', 'ASC']]
  // Render attributes in information overview
  }).then((data) => {
    const dataset = data.get({ plain: true });
    res.json({ dataset });
  });
});
// PUT route to update dataset and attribute metadata
router.put('/dataset/:dataset_id', (req, res) => {
  datasetController.updateDataset(req).then(() => {
    res.json({ done: true });
  });
});

// POST route to add a new dataset via file upload
router.post('/dataset/new', (req, res) => {
  datasetController.createDataset(req)
    .then(dataset => res.json({ status: 'success', id: dataset.id }))
  // If the file had the wrong file type, report to client and delete the temporary file
    .catch(WrongFileTypeError, (e) => {
      del([path.format(e.filePath)])
        .then(() => console.log('cleaned up'))
        .catch(error => console.log(error));
      res.json({ status: 'error', error: 'WrongFileType' });
    })
    // If an error occurred while opening the data source with ogr2ogr,
    // report to the client and delete temporary files
    .catch(UnableToOpenDatasourceError, (e) => {
      del([path.parse(e.filePaths.src).dir.concat('/**')])
        .then(() => {});
      res.json({ status: 'error', error: 'UnableToOpen' });
    })
    .catch(error => console.log(error));
});
module.exports = router;
