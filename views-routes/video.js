const videoController = require('../controllers/video');

exports.load = (app) => {
    app.post('/videos', videoController.renderQueue);
};
