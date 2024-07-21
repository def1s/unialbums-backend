const AlbumModel = require('../models/album-model');
const minioClient = require('../configs/minioClient');
const fs = require('fs');
const uuid = require("uuid");
const AlbumDto = require('../dtos/album-dto');
const ApiError = require('../exceptions/api-error');

class AlbumService {
    async getAlbumsByUserId(userId) {
        const albums = await AlbumModel.find({userId});
        return albums.map(album => new AlbumDto(album));
    }

    async createAlbum(userId, title, artist, cover) {
        let coverUrl = null;

        // TODO вынести в отдельную функцию добавление картинки в minio
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

    async updateAlbum(userId, albumId, title, artist, cover) {
        const album = await AlbumModel.findById(albumId);

        if (album.userId + '' !== userId) {
            throw ApiError.BadRequest('Доступ к редактированию альбома запрещен');
        }

        album.title = title;
        album.artist = artist;

        // TODO вынести в отдельную функцию добавление картинки в minio
        if (cover) {
            const metaData = {
                'Content-Type': cover.mimetype
            };

            const coverName = uuid.v4();
            // Загрузка обложки в MinIO
            await minioClient.putObject('images', coverName, cover.buffer, metaData);
            album.cover = `http://localhost:9000/images/${coverName}`;
        }

        album.save();
    }
}

module.exports = new AlbumService();