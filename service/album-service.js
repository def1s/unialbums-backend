const AlbumModel = require('../models/album-model');
const minioClient = require('../configs/minioClient');
const fs = require('fs');
const uuid = require("uuid");
const AlbumDto = require('../dtos/album-dto');
const ApiError = require('../exceptions/api-error');

const MINIO_URL = process.env.MINIO_URL || 'http://localhost:9000';

class AlbumService {
    async getAlbumsByUserId(userId) {
        const albums = await AlbumModel.find({userId});
        return albums.map(album => new AlbumDto(album));
    }

    async createAlbum(userId, title, artist, cover, bitsRating, textRating, tracksRating, atmosphereRating) {
        let coverUrl = null;

        // TODO вынести в отдельную функцию добавление картинки в minio
        if (cover) {
            const metaData = {
                'Content-Type': cover.mimetype
            };

            const coverName = uuid.v4();
            // Загрузка обложки в MinIO
            await minioClient.putObject('images', coverName, cover.buffer, metaData);
            coverUrl = `${MINIO_URL}/images/${coverName}`;
        }
        // TODO сделать в будущем кастомизируемые критерии оценки
        // TODO вынести в отдельную функцию
        const multiplier = 8/3;
        const totalRating = Math.floor(+tracksRating * multiplier * 2 + +atmosphereRating * multiplier + +bitsRating + +textRating);

        // Сохранение альбома в базу данных
        const album = await AlbumModel.create({
            userId,
            title,
            artist,
            bitsRating,
            textRating,
            tracksRating,
            atmosphereRating,
            totalRating,
            cover: coverUrl
        });

        return album;
    }

    async getAlbumById(albumId) {
        const album = await AlbumModel.findById(albumId);
        return new AlbumDto(album);
    }

    async getAlbumDescription(albumId, userId) {
        const album = await AlbumModel.findById(albumId);

        return {
            isEditable: userId === album.userId,
            title: album.title,
            artist: album.artist,
            cover: album.cover
        }
    }

    async getAlbumRating(albumId, userId) {
        const album = await AlbumModel.findById(albumId);

        return {
            isEditable: userId === album.userId,
            bitsRating: album.bitsRating,
            textRating: album.textRating,
            tracksRating: album.tracksRating,
            atmosphereRating: album.atmosphereRating,
            totalRating: album.totalRating
        }
    }

    async updateAlbumRating(albumId, textRating, tracksRating, atmosphereRating, bitsRating) {
        const album = await AlbumModel.findById(albumId);
        album.textRating = textRating;
        album.tracksRating = tracksRating;
        album.atmosphereRating = atmosphereRating;
        album.bitsRating = bitsRating;

        // TODO вынести в отдельную функцию
        const multiplier = 8/3;
        const totalRating = Math.floor(+tracksRating * multiplier * 2 + +atmosphereRating * multiplier + +bitsRating + +textRating);

        album.totalRating = totalRating;
        album.save();

        return {
            textRating,
            tracksRating,
            atmosphereRating,
            bitsRating,
            totalRating
        };
    }

    async updateAlbumDescription(userId, albumId, title, artist, cover) {
        const album = await AlbumModel.findById(albumId);

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
            album.cover = `${MINIO_URL}/images/${coverName}`;
        }

        album.save();
    }

    async deleteAlbum(userId, albumId) {
        const album = await AlbumModel.findById(albumId);
        if (album.userId !== userId) {
            ApiError.AccessDenied();
        }

        await AlbumModel.findByIdAndDelete(albumId);
    }
}

module.exports = new AlbumService();