const fs = require('fs');
const path = require('path');

exports.loadModulesInDir = (dir, app) => {
    const currentDirectory = path.resolve(__dirname, `../${dir}`);
    const allFilesInDir = fs.readdirSync(currentDirectory);
    switch(dir) {
        case 'apis': {
            allFilesInDir.forEach(file => {
                if (file === 'index.js') {
                    return;
                }
                require(`../${dir}/${file}`).load(app);
            });
            return;
        }
        default: {
            allFilesInDir.forEach(file => {
                if (file === 'index.js') {
                    return;
                }
                require(`../${dir}/${file}`)
            });
        }
    }
};
