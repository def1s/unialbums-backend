const AlbumModel = require('../models/album-model');
const minioClient = require('../configs/minioClient');
const fs = require('fs');

class AlbumService {
    async getAlbumsByUserId(userId) {
        const albums = await AlbumModel.find({userId});
        return albums;
    }

    // async createAlbum(userId, title, artist, cover) {
    //     const album = await AlbumModel.create({
    //         userId,
    //         title,
    //         artist,
    //         cover
    //     });
    //
    //     console.log(album);
    //     return album;
    // }

    async createAlbum(userId, title, artist, cover) {
        let coverUrl = null;

        if (cover) {
            const metaData = {
                'Content-Type': cover.mimetype
            };

            // TODO подумать, нет ли более логичного решения без промежуточных загрузок
            const file = await fs.promises.readFile(cover.path);

            // Загрузка обложки в MinIO
            await minioClient.putObject('images', cover.filename, file, metaData);
            coverUrl = `http://localhost:9000/images/${cover.filename}`;

            // Удаление временного файла
            await fs.promises.unlink(cover.path);

            // const file = fs.readFileSync(cover.path);
            //
            // // Загрузка обложки в MinIO
            // await minioClient.putObject('images', cover.filename, file, metaData);
            // coverUrl = `http://localhost:9000/images/${cover.filename}`;
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