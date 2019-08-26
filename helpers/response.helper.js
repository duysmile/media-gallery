function ResponseSuccess(message, data, res) {
    if (!res) {
        return {
            message,
            data
        };
    }
    // TODO: custom status code response
    return res.status(200).json({
        message,
        data
    });
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