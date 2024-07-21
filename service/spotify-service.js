class SpotifyService {
    static async getToken() {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            body: new URLSearchParams({
                'grant_type': 'client_credentials',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT + ':' + process.env.SPOTIFY_SECRET).toString('base64')),
            },
        });

        return await response.json();
    }

    async searchAlbums(title) {
        const token = await SpotifyService.getToken();

        const response = await fetch(`https://api.spotify.com/v1/search?q=${title}&type=album`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token.access_token },
        }).then(res => res.json());

        // TODO вынести в dto
        // вытаскиваю только нужные мне поля
        return response.albums.items.map(album => {
            const artists = album.artists.map(artist => artist.name);
            const name = album.name;
            const image300x300 = album.images.find(image => image.width === 300 && image.height === 300)?.url;
            const id = album.id;

            return { id, artists, name, cover: image300x300 };
        });
    }

    async getAlbum(albumId) {
        const token = await SpotifyService.getToken();

        const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token.access_token },
        }).then(res => res.json());

        // TODO вынести в dto (взять от предыдущего)
        return {
            id: response.id,
            name: response.name,
            artists: response.artists.map(artist => artist.name),
            cover: response.images.find(image => image.width === 640 && image.height === 640)?.url
        }
    }
}

module.exports = new SpotifyService();