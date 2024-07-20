const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const albumController = require('../controllers/album-controller');

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

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
router.get('/users', authMiddleware, userController.getUsers);
router.get('/initUser', authMiddleware, userController.initUser);

router.get('/albums/getByUserId', authMiddleware, albumController.getAlbumsByUserId);
router.post('/albums/create', authMiddleware, upload.single('cover'), albumController.createAlbum);

module.exports = router;
