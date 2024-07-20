const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedErrors());
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.UnauthorizedErrors());
        }

        const userData = tokenService.validateToken(accessToken, process.env.JWT_ACCESS_SECRET);
        if (!userData) {
            return next(ApiError.UnauthorizedErrors());
        }

        req.user = userData;
        next();
    } catch (e) {
        return next(ApiError.UnauthorizedErrors());
    }
}