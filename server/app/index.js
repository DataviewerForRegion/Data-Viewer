/*
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Main configuration file for the back-end application
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const session = require('express-session');
const setupPassport = require('./authentication/init');
const app = express();
const helmet = require('helmet');
// Use helmet to prevent XSS
app.use(helmet());
// Set up view directory
app.set('views', `${__dirname}/views`);
// Set template engine
app.set('view engine', 'pug');
// Set up database models
app.set('models', require('./models'));
// Set up logging
app.use(morgan('dev'));
// Set up body parser for json parsing
app.use(bodyParser.urlencoded({ defer: true, extended: true }));
app.use(bodyParser.json());
// Serve static assets
app.use(express.static('./build'));
// Set up authentication session
app.use(session({
  secret: 'asdji8238uajsd92',
  resave: false,
  saveUninitialized: false,
}));
// Set up passport authentication
setupPassport(app);
// Import admin routes
const admin = require('./routes/admin');
// Use admin routes for the end point
app.use('/api/admin', admin);
// Import main routes
const main = require('./routes/main');
// Use main routes
app.use('/api', main);
// Import index route
const index = require('./routes/index');
// Use index route for all other endpoints
app.use('/*', index);

module.exports = app;
