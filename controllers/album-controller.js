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

    // TODO? сделать условие видимость для альбома (приватный/публичный)
    async getAlbumById(req, res, next) {
        try {
            const albumId = req.params.id;
            const album = await albumService.getAlbumById(albumId);
            return res.json({data: {...album}});
        } catch (e) {
            next(e);
        }
    }

    async getAlbumDescription(req, res, next) {
        try {
            const albumId = req.params.id;
            const userId = req.user.id;

            const albumDescription = await albumService.getAlbumDescription(albumId, userId);
            return res.json({data: albumDescription});
        } catch (e) {
            next(e);
        }
    }

    async getAlbumRating(req, res, next) {
        try {
            const albumId = req.params.id;
            const userId = req.user.id;

            const albumRating = await albumService.getAlbumRating(albumId, userId);
            return res.json({data: albumRating});
        } catch (e) {
            next(e);
        }
    }

    async updateAlbumRating(req, res, next) {
        try {
            const albumId = req.params.id;
            const {
                textRating,
                tracksRating,
                atmosphereRating,
                bitsRating
            } = req.body;

            const totalRating = await albumService.updateAlbumRating(
                albumId,
                textRating,
                tracksRating,
                atmosphereRating,
                bitsRating
            );

            // TODO отправлять обратно обновленные данные рейтинга
            return res.json({data: totalRating, message: 'Рейтинг успешно обновлен'});
        } catch (e) {
            next(e);
        }
    }

     async createAlbum(req, res, next) {
        try {
            const userId = req.user.id;
            const {
                title,
                artist,
                bitsRating,
                textRating,
                tracksRating,
                atmosphereRating
            } = req.body;
            const cover = req.file;

            await albumService.createAlbum(
                userId,
                title,
                artist,
                cover,
                bitsRating,
                textRating,
                tracksRating,
                atmosphereRating
            );
            return res.json({message: 'Альбом создан'});
        } catch (e) {
            next(e);
        }
     }

     async updateAlbumDescription(req, res, next) {
        try {
            const albumId = req.params.id;
            const userId = req.user.id;
            const {
                title,
                artist
                // TODO добавить поля для оценок
            } = req.body;
            const cover = req.file;

            await albumService.updateAlbumDescription(userId, albumId, title, artist, cover);
            return res.json({message: 'Данные успешно обновлены'});
        } catch (e) {
            next(e);
        }
     }

     async deleteAlbum(req, res, next) {
        try {
            const albumId = req.params.id;
            const userId = req.user.id;

            await albumService.deleteAlbum(userId, albumId);
            return res.json({message: 'Альбом успешно удален'});
        } catch (e) {
            next(e);
        }
     }
}

module.exports = new AlbumController();