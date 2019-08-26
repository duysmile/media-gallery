const imageController = require('../controllers/image');

exports.load = (app) => {
    app.post('/api/v1/images', imageController.uploadImage);
};
