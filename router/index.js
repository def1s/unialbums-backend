const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const editAlbumPermissionMiddleware = require('../middlewares/edit-album-permission-middleware');
const albumController = require('../controllers/album-controller');
const spotifyController = require('../controllers/spotify-controller');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });


// TODO провалидировать все поля

/**
 * регистрация, вход и активация
 */
router.post(
    '/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 20}),
    userController.registration
);
router.post('/loginByEmail', userController.loginByEmail);
router.post('/loginByUsername', userController.loginByUsername);
router.post('/logout', userController.logout);

router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/initUser', authMiddleware, userController.initUser);


/**
 * альбомы
 */
router.get('/albums/getByUserId', authMiddleware, albumController.getAlbumsByUserId);
router.post('/albums/create', authMiddleware, upload.single('cover'), albumController.createAlbum);

router.get('/albums/:id', authMiddleware, albumController.getAlbumById);
router.delete('/albums/:id', authMiddleware, albumController.deleteAlbum);

router.get('/albums/description/:id', authMiddleware, albumController.getAlbumDescription);
router.put(
    '/albums/description/:id',
    authMiddleware,
    editAlbumPermissionMiddleware,
    upload.single('cover'),
    albumController.updateAlbumDescription
);
router.get('/albums/rating/:id', authMiddleware, albumController.getAlbumRating);
router.put('/albums/rating/:id', authMiddleware, editAlbumPermissionMiddleware, albumController.updateAlbumRating);



/**
 * пользователь
 */
router.get('/users/myProfile', authMiddleware, userController.getUserProfile);
router.put('/users/myProfile', authMiddleware, upload.single('avatar'), userController.updateUserProfile);


/**
 * spotify api
 */
router.get('/spotify/search/:title', spotifyController.searchAlbums);
router.get('/spotify/album/:albumId', spotifyController.getAlbum);

module.exports = router;
