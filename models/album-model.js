const {Schema, model} = require('mongoose');

const AlbumSchema = new Schema({
    userId: {type: String},
    title: {type: String},
    artist: {type: String},
    cover: {type: String},
    bitsRating: {type: Number},
    textRating: {type: Number},
    tracksRating: {type: Number},
    atmosphereRating: {type: Number},
    totalRating: {type: Number}
});

module.exports = model("Album", AlbumSchema);
