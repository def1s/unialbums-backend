const AlbumModel = require('../models/album-model');
const minioClient = require('../configs/minioClient');
const fs = require('fs');
const uuid = require("uuid");
const AlbumDto = require('../dtos/album-dto');

class AlbumService {
    async getAlbumsByUserId(userId) {
        const albums = await AlbumModel.find({userId});
        return albums.map(album => new AlbumDto(album));
    }

    async createAlbum(userId, title, artist, cover) {
        let coverUrl = null;

        if (cover) {
            const metaData = {
                'Content-Type': cover.mimetype
            };

            const coverName = uuid.v4();
            // Загрузка обложки в MinIO
            await minioClient.putObject('images', coverName, cover.buffer, metaData);
            coverUrl = `http://localhost:9000/images/${coverName}`;
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

    async getAlbumById(albumId) {
        const album = await AlbumModel.findById(albumId);
        return new AlbumDto(album);
    }
}

module.exports = new AlbumService();