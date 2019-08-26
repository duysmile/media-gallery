const mongoose = require('mongoose');
const { loadModulesInDir } = require('../helpers/load-modules');

module.exports = {
    mongoose,
    connectDB: function() {
        return mongoose.connect(process.env.MONGO_CONNECTION, { 
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
    },
    loadModels: function() {
        loadModulesInDir('models');
    }
};