const spotifyService = require('../service/spotify-service');

class SpotifyController {
    async searchAlbums(req, res, next) {
        try {
            const title = req.params.title;
            const albums = await spotifyService.searchAlbums(title);
            return res.json({data: albums});
        } catch (e) {
            next(e);
        }
    }

    async getAlbum(req, res, next) {
        try {
            const albumId = req.params.albumId;
            const album = await spotifyService.getAlbum(albumId);
            return res.json({data: album});
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new SpotifyController();