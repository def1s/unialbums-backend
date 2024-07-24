const AlbumModel = require('../models/album-model');
const ApiError = require('../exceptions/api-error');

// проверяет наличие прав у пользователя на редактирование альбома
module.exports = async function (req, res, next) {
    try {
        const albumId = req.params.id;
        const userId = req.user.id;
        const album = await AlbumModel.findById(albumId);

        if (userId !== album.userId) {
            return next(ApiError.AccessDenied());
        } else {
            next();
        }
    } catch (e) {
        next(ApiError.BadRequest(e));
    }
}