const handleErrorMessage = (err) => {
    switch(err.message) {
        default:
            return {
                statusCode: 400,
                message: err.message
            };
    };
};

exports.load = (app) => {
    app.use(function (err, req, res, next) {
        // console.error(JSON.stringify(err, null, 2));
        console.error(err);
        
        if (Array.isArray(err.errors)) {
            const messages = err.errors.map(function(item) {
                return item.messages;
            });
            return res.status(400).json({
                errors: messages
            });
        }

        const errorInfo = handleErrorMessage(err);
        return res.status(errorInfo.statusCode).json({
            message: errorInfo.message
        });
    });
};
