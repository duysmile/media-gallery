const kue = require('kue');
const queue = kue.createQueue();

const convertVideoWorker = require('./convert-video');

// config number of concurrency
const numberOfConcurrency = {
    convertVideo: 5
};

// Init process handler
queue.process('convert-video', numberOfConcurrency.convertVideo, convertVideoWorker.process);

module.exports = {
    kue,
    queue
};
