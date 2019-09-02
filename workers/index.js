const kue = require('kue');
const queue = kue.createQueue({
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});

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
