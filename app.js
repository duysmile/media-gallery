const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');

const apis = require('./apis');
const errorHandler = require('./common/errorHandler');

const app = express();

// Config app
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
app.set('view engine', 'ejs');

// Load apis
apis.load(app);

// Error Handler
errorHandler.load(app);

module.exports = app;
