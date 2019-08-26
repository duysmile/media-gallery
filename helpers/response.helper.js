const _ = require('lodash');

function ResponseSuccess(message, data, res) {
    if (!res) {
        return {
            message,
            data
        };
    }

    const response = _.omitBy({
        message,
        data
    }, _.isNil);
    // TODO: custom status code response
    return res.status(200).json(response);
}

function ResponseError(message, res) {
    if (!res) {
        return {
            message
        };
    }
    return res.status(200).json({
        success: false,
        message
    });
}

module.exports = {
    ResponseSuccess,
    ResponseError
};