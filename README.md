# Dataviewer for REGION

A web-based GIS data viewer with choropleth maps, scatter plots, bar charts, descriptive statistics and brushing facility.
This tool was originally written in the course of a master's thesis at the [Vienna University of Business and Economics](https://wu.ac.at).
The goal of the thesis was to provide the open access journal [REGION](https://region.ersa.org) of the European Regional Science Association [ERSA](https://ersa.org) with a tool to make data published with articles available online.

## Components
This repository contains both, back-end and front-end of the data-viewer.

### Front-End
The front-end is written in JavaScript using [RiotJS](https://riot.js.org/) as a UI-library and [Blaze](https://www.blazeui.com/) as a CSS framework.

### Back-End
The back-end is written in NodeJS using the [ExpressJS](https://expressjs.com/) framework.

## Getting started
To get the the master thesis up and running as fast as possible, a docker-compose file is included in this repository. This is configured to launch:
- A container running the NodeJS application
- A container running PostgreSQL
- A container running Nginx as reverse proxy to the NodeJS application 

The compose file also configures 3 volumes for node_modules, the database data and the uploaded files.
### Prerequisites
- Docker installed
- Docker compose installed
- NodeJS and NPM installed
- This repository cloned to your disk

### Configuration
Please change the environment variables in the `/server/.env` file before deploying the application anywhere. WARNING: Using the default username and password combination is unsafe. Also Nginx should be configured to use TLS in order to avoid any eavesdropping.

### Building
To build the client bundle, please switch to the `client/` folder and run `npm install` followed by `npm run-script build`.

### Deploying
Once you built the client bundle, changed adjusted the docker files and changed the environment variables, you can go to the root of this project and run `docker-compose up`. This will pull/create the necessary docker images and start them.

## License
This projected is dual-licensed:
- GPLv3 for academic, governmental and non-commercial use
- Proprietary for commercial use (Feel free to contact the authors for licensing information)