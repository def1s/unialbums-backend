const jwt = require("jsonwebtoken");
const tokenModel = require('../models/token-model');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '15m'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});

        return {
            accessToken,
            refreshToken
        }
    }

    // сохранения токена в базу данных
    // недостаток - может быть одновременно один активный пользователь
    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({user: userId});

        // если по id пользователя токен уже есть, то обновляем его токен
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        // сохранения пользователя и токена
        const token = await tokenModel.create({user: userId, refreshToken});
        return token;
    }

    async removeToken(refreshToken) {
        await tokenModel.deleteOne({refreshToken});
        // deletedCount будет равно либо 1, либо 0
        // преобразуем в булевое значение, чтобы стало ясно, удалился токен или нет
        // return !!deletedCount;
    }

    validateToken(token, secret) {
        try {
            const userData = jwt.verify(token, secret);
            return userData;
        } catch (e) {
            return null;
        }
    }

    async findToken(refreshToken) {
        const token = await tokenModel.findOne({refreshToken});
        return token;
    }
}

module.exports = new TokenService();