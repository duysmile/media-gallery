const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const { kue } = require('./workers');

const apis = require('./apis');
const views = require('./views-routes');
const errorHandler = require('./common/errorHandler');

const app = express();

// Config app
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
app.set('view engine', 'ejs');
app.use('/job-queue', kue.app);

// Load apis
apis.load(app);
// Load views
views.load(app);

// Error Handler
errorHandler.load(app);

module.exports = app;
