/**
 * Copyright (c) 2018 Sebastian Altenhuber, Patrick Humme
 *
 * @file Entry point for the front-end of the app. Import riot tags and start the riot router.
 * @author Sebastian Altenhuber <sebastian.altenhuber@gmail.com>
 * @author Patrick Humme <pathumme@gmail.com>
 */
import 'babel-polyfill';
import * as riot from 'riot';
import route from 'riot-route';
import 'font-awesome-webpack';
import '../sass/app.scss';
import './tags/components/pagination.tag.html';
import './tags/admin/add-dataset.tag.html';
import './tags/admin/edit-dataset.tag.html';
import './tags/admin/content.tag.html';
import './tags/admin/manage-datasets.tag.html';
import './tags/app.tag.html';
import './tags/components/range-slider.tag.html';
import './tags/components/map-settings.tag.html';
import './tags/components/checkbox-dropdown-select.tag.html';
import './tags/mixins/index';
import './tags/layout/main.tag.html';
import './tags/layout/topbar.tag.html';
import './tags/layout/sidebar.tag.html';
import './tags/layout/view-content.tag.html';
import './tags/pages/dataset/barchart.tag.html';
import './tags/pages/dataset/scatterplot.tag.html';
import './tags/pages/dataset/boxplot.tag.html';
import './tags/pages/dataset/statistics.tag.html';
import './tags/pages/dataset/map-choropleth.tag.html';
import './tags/pages/dataset/error.tag.html';
import './tags/pages/dataset/map-select.tag.html';
import './tags/pages/dataset/datatable.tag.html';
import './tags/pages/dataset/overview.tag.html';
import './tags/components/error.tag.html';
import './tags/pages/index/about.tag.html';
import './tags/pages/index/browse.tag.html';
import './tags/pages/index/welcome.tag.html';
import './tags/pages/index/help.tag.html';
import './tags/pages/index/error.tag.html';
import './tags/admin/edit-user.tag.html';
import './tags/components/loading.tag.html';
import './tags/pages/login.tag.html';
import './tags/components/colorpicker.tag.html';

import routes from './routes';
import User from './controller/userController';

riot.route = route;
// Define initial variables
let app;

// Set the routing base to '/' and start the routing with the riot router.
riot.route.base('/');
riot.route.start(true);

// Add all routes to the riot router. Every route gets the right controller
// and mounts the app tag with the controller as parameter.
Object.keys(routes).forEach((routeObject) => {
  riot.route(routeObject, (...args) => {
    // Get the initial data from server (user and user login status).
    const { initialData } = window;
    // Create new user with the data sent by server.
    const user = new User(initialData.user.username, initialData.user.loggedIn);
    // Get the right controller and pass URL parameters
    const controller = routes[routeObject](args);
    // Mount the <app></app> tag if it does not exist
    if (!app) [app] = riot.mount('app', { controller, user });
    // Mount the according view.
    app.mountView(controller);
  });
});
