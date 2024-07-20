const albumService = require('../service/album-service');

class AlbumController {
    async getAlbumsByUserId(req, res, next) {
        try {
            const userId = req.user.id;
            const albums = await albumService.getAlbumsByUserId(userId);
            return res.json({data: albums});
        } catch (e) {
            next(e);
        }
    }

    // TODO? сделать, чтобы каждый пользователь мог получить доступ только к своим альбомом
    async getAlbumById(req, res, next) {
        try {
            const albumId = req.params.id;
            const album = await albumService.getAlbumById(albumId);
            return res.json({data: {...album}});
        } catch (e) {
            next(e);
        }
    }

     async createAlbum(req, res, next) {
        try {
            const userId = req.user.id;
            const {
                title,
                artist
                // TODO добавить поля для оценок
            } = req.body;
            const cover = req.file;

            await albumService.createAlbum(userId, title, artist, cover);
            return res.json({message: 'Альбом создан'});
        } catch (e) {
            next(e);
        }
     }
}

module.exports = new AlbumController();