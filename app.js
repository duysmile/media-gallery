const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const { kue } = require('./workers');
const cors = require('cors');

const apis = require('./apis');
const errorHandler = require('./common/errorHandler');

const app = express();

const headers = {
    // 'allowedHeaders': ['Content-Type', 'Authorization'],
    'origin': '*',
    // 'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // 'preflightContinue': true
};

app.use(cors(headers));
app.options('*', cors(headers));

app.use('/uploads', express.static('uploads'));

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

// Error Handler
errorHandler.load(app);

module.exports = app;
