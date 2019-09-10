const videoController = require('../controllers/video');

exports.load = (app) => {
    app.post('/api/v1/videos', videoController.uploadVideo);
    app.get('/api/v1/videos', videoController.showAllVideos);
    app.get('/api/v1/videos/load/:videoId', videoController.loadVideo);
    app.get('/api/v1/videos/:videoId', videoController.getVideo);
};
