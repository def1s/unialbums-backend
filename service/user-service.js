const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('../service/mail-service');
const tokenService = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

// сервис отвечает за логику работы с пользователями, для того, чтобы не загромождать контроллер
// в паре используется tokenService для управления токенами
class UserService {
    async registration(email, username, firstName, lastName, password) {
        const candidate = await UserModel.findOne({email});
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтой ${email} уже существует`);
        }

        // все пароли храним в хэше
        const hashPassword = await bcrypt.hash(password, 3);
        // генерация уникальной ссылки для активации
        const activationLink = uuid.v4();
        // создание экземпляра пользователя
        const user = await UserModel.create({
            email,
            username,
            firstName,
            lastName,
            password: hashPassword,
            activationLink
        });
        // отправка сообщения для активации на почту
        // await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink});
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }

        user.isActivated = true;
        await user.save();
    }

    // TODO вынести в доп. функцию дублирующийся код
    async loginByEmail(email, password) {
        const user = await UserModel.findOne({email});
        if (!user) {
            throw ApiError.BadRequest('Нет пользователя с таким email');
        }

        const isPasswordsEqual = await bcrypt.compare(password, user.password);
        if (!isPasswordsEqual) {
            throw ApiError.BadRequest('Неправильный пароль');
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens,
            user: userDto
        }
    }

    async loginByUsername(username, password) {
        const user = await UserModel.findOne({username});
        if (!user) {
            throw ApiError.BadRequest('Нет пользователя с таким именем пользователя');
        }

        const isPasswordsEqual = await bcrypt.compare(password, user.password);
        if (!isPasswordsEqual) {
            throw ApiError.BadRequest('Неправильный пароль');
        }

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens
        }
    }

    async logout(refreshToken) {
        await tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedErrors();
        }

        const userData = tokenService.validateToken(refreshToken, process.env.JWT_REFRESH_SECRET);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedErrors();
        }

        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);

        return {
            ...tokens
        }
    }

    // TODO удалить этот метод в будущем
    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }

    async initUser(userId) {
        const user = await UserModel.findById(userId);
        const userDto = new UserDto(user);
        return userDto;
    }
}

module.exports = new UserService();