// убираем из модели все ненужные поля и преобразовываем в объект
module.exports = class AlbumDto {
    albumId;
    userId;
    title;
    artist;
    cover;
    bitsRating;
    textRating;
    tracksRating;
    atmosphereRating;
    totalRating;

    constructor(model) {
        this.albumId = model._id;
        this.userId = model.userId;
        this.title = model.title;
        this.artist = model.artist;
        this.cover = model.cover;
        this.bitsRating = model.bitsRating;
        this.textRating = model.textRating;
        this.tracksRating = model.tracksRating;
        this.atmosphereRating = model.atmosphereRating;
        this.totalRating = model.totalRating;
    }
}