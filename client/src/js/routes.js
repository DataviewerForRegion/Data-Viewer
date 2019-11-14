/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Contains the routes for the front-end of the app
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
import indexController from './controller/indexController';
import datasetController from './controller/datasetController';
import adminController from './controller/adminController';

const riot = require('riot');

const controllers = {};
/*
 * Get controller if it exists or create a new one.
 * @param {String} name - Name to store and access controller.
 * @param {Controller} Controller - Controller class which to get or create.
 * @param {Object} opts - Options object.
 * @return {Controller} Newly created or previously cached controller.
 *
 */
const getController = function (name, Controller, opts) {
  // If controller exists, update its' options, otherwise instantiate a new controller of
  // the given type (adminController, indexController, datasetController)
  if (controllers[name]) {
    controllers[name].update(opts);
  } else {
    controllers[name] = new Controller(opts);
  }
  return controllers[name];
};

const routes = {
  // Routes for the admin section.
  admin: () =>
    getController('admin', adminController, { url: '/api/login', view: 'admin' }),
  // Manage datasets route needs to be able to parse URL parameters
  'admin/manage..': () =>
    getController('admin', adminController, {
      url: '/api/login',
      view: 'admin',
      subview: 'manage',
      query: riot.route.query(),
    }),
  // Routes for the detailed admin views (e.g. edit dataset)
  'admin/*/*': args =>
    getController('admin', adminController, {
      url: '/api/login',
      view: 'admin',
      subview: args[0],
      datasetId: args[1],
    }),
  // Routes for overall admin views (e.g. manage datasets)
  'admin/*': args =>
    getController('admin', adminController, {
      url: '/api/login',
      view: 'admin',
      subview: args[0],
    }),
  // The login route must be able to parse URL parameters
  'login..': () =>
    getController('admin', adminController, {
      url: '/api/login',
      view: 'login',
      query: riot.route.query(),
    }),
  // Routes for the index section (browse datasets).
  '/': () =>
    getController('index', indexController, {
      url: '/api/datasets',
    }),
  'browse..': () =>
    getController('index', indexController, {
      url: '/api/datasets',
      subview: 'browse',
      query: riot.route.query(),
    }),
  about: () =>
    getController('index', indexController, {
      url: '/api/datasets',
      subview: 'about',
      query: riot.route.query(),
    }),
  'help..': () =>
    getController('index', indexController, {
      url: '/api/datasets',
      subview: 'help',
      query: riot.route.query(),
    }),
  // Routes for viewing a specific dataset.
  'v/*': args =>
    getController('view', datasetController, {
      id: args[0],
    }),
};
// Add view dataset routes, one for each subview
const viewDatasetViews = ['overview', 'ms', 'mc', 'bc', 'sp', 'dt', 'bp', 'st'];

viewDatasetViews.forEach((view) => {
  routes[`v/*/${view}..`] = args => getController('view', datasetController, {
    id: args[0],
    subview: view,
    parameters: riot.route.query(),
  });
});
// Add catch all route last
routes['*..'] = args => getController('index', indexController, {
  url: '/api/datasets',
  subview: args[0],
});

export default routes;
