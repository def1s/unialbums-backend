const userService = require('../service/user-service');
const {validationResult} = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()));
            }

            const {email, username, firstName, lastName, password} = req.body;
            const {refreshToken, ...userData} = await userService.registration(email, username, firstName, lastName, password);

            res.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

            return res.json({
                ...userData,
                message: "Вы успешно зарегистрировались"
            });
        } catch (e) {
            next(e);
        }
    }

    // TODO? вынести в доп. функцию дублирующийся код
    async loginByEmail(req, res, next) {
        try {
            const {email, password} = req.body;
            const {refreshToken, ...userData} = await userService.loginByEmail(email, password);

            res.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async loginByUsername(req, res, next) {
        try {
            const {username, password} = req.body;
            const {refreshToken, accessToken} = await userService.loginByUsername(username, password);

            res.cookie('refreshToken', refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

            return res.json({
                data: {accessToken}
            });
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            // удаление токена из базы данных
            await userService.logout(refreshToken);
            // удаление токена из cookie
            res.clearCookie('refreshToken');
            return res.status(200).send();
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    // выставляем новый токен для пользователя и возвращаем обновленные данные у пользователя
    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json({
                data: {accessToken: userData.accessToken}
            });
        } catch (e) {
            next(e);
        }
    }

    async initUser(req, res, next) {
        try {
            const userTokenData = req.user;
            const initData = await userService.initUser(userTokenData.id);
            return res.json({
                data: initData
            });
        } catch (e) {
            next(e);
        }
    }

    async getUserProfile(req, res, next) {
        try {
            const userTokenData = req.user;
            const userData = await userService.getUserProfile(userTokenData.id);
            return res.json({
                data: userData
            });
        } catch (e) {
            next(e);
        }
    }

    async updateUserProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const {firstName, lastName, username} = req.body;
            const avatar = req.file;

            await userService.updateUserProfile(userId, firstName, lastName, username, avatar);
            return res.json({message: 'Данные успешно обновлены'});
        } catch (e) {
            next(e);
        }
    }
}


module.exports = new UserController();