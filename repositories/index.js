const BaseRepository = require('./base.repository');
const { loadModels } = require('../models');

loadModels();

module.exports = {
    videoRepository: new BaseRepository('Video'),
};
