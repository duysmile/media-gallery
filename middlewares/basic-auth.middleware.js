const auth = require('http-auth');

const options = {
    realm: 'Monitor Area'
};
const basic = auth.basic(options, (username, password, callback) => {
    callback(username === process.env.USERNAME && password === process.env.PASSWORD);
});

module.exports = auth.connect(basic);
