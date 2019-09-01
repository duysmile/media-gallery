const kue = require('kue');
const queue = kue.createQueue();

const convertVideo = require('./convert-video');
// TODO: config queue here
const numberOfConcurrency = 5;
queue.process('convert-video', numberOfConcurrency, convertVideo);

module.exports = {
    kue,
    queue
};
