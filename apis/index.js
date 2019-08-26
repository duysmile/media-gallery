const { loadModulesInDir } = require('../helpers/load-modules');

exports.load = (app) => {
    loadModulesInDir('apis', app);
};
