const ApiError = require('../exceptions/api-error');
// middleware для обработки ошибок
// позволяет сразу отправлять в ответе ошибку, если такая произошла во время выполнения кода
module.exports = function (err, req, res, next) {
    console.log(err);

    if (err instanceof ApiError) {
        return res.status(err.status).json({message: err.message, errors: err.errors});
    }

    return res.status(500).json({message: 'Произошла непредвиденная ошибка'});
}