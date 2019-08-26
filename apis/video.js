const videoController = require('../controllers/video');

exports.load = (app) => {
    app.post('/api/v1/videos', videoController.uploadVideo);
};
