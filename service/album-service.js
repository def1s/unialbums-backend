const AlbumModel = require('../models/album-model');
const minioClient = require('../configs/minioClient');
const fs = require('fs');

class AlbumService {
    async getAlbumsByUserId(userId) {
        const albums = await AlbumModel.find({userId});
        return albums;
    }

    async createAlbum(userId, title, artist, cover) {
        let coverUrl = null;

        if (cover) {
            const metaData = {
                'Content-Type': cover.mimetype
            };

            // Загрузка обложки в MinIO
            await minioClient.putObject('images', cover.originalname, cover.buffer, metaData);
            coverUrl = `http://localhost:9000/images/${cover.originalname}`;
        }

        // Сохранение альбома в базу данных
        const album = await AlbumModel.create({
            userId,
            title,
            artist,
            cover: coverUrl
        });

        return album;
    }
}

module.exports = new AlbumService();