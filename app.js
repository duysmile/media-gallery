const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const { kue } = require('./workers');

const apis = require('./apis');
const views = require('./views-routes');
const errorHandler = require('./common/errorHandler');

const app = express();

// Config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
    extended: false,
    // limit: '10GB',
    // parameterLimit: 1000000
}));
app.use(compression());
app.use('/job-queue', kue.app);

// Load apis
apis.load(app);
// Load views
views.load(app);

// Error Handler
errorHandler.load(app);

module.exports = app;
