const jwtHelper = require('../helpers/jwt.helper');

exports.verifyToken = (req, res, next) => {
    const token = req.body.token || req.params.token || req.headers.authorization;
    if (!token) {
        return next(new Error('AUTHENTICATION_FAILED'));
    }
    const [ prefixToken, accessToken ] = token.split(' ');
    if (prefixToken !== 'Bearer') {
        return next(new Error('JWT_INVALID_FORMAT'));
    }
    const dataVerified = jwtHelper.verifyToken(accessToken);
    if (dataVerified.resetPassword) {
        return next(new Error('INVALID_TOKEN'));
    }
    req.user = dataVerified;
    return next();
}
