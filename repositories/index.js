const BaseRepository = require('./base.repository');
const { loadModels } = require('../models');

loadModels();

module.exports = {
    userRepository: new BaseRepository('User'),
};
