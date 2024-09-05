require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const router = require('./router/index');
const errorMiddleware = require('./middlewares/error-middleware');
const fs = require('fs');
const https = require('https');

const PORT = process.env.PORT || 5050;
const mode = process.env.MODE || 'development';
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/api', router);
// middleware для обработки ошибок должен идти последним в цепочке middlewares
app.use(errorMiddleware);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);

        if (process.env.MODE === 'production') {
            // В продакшн используем HTTPS
            const options = {
                // TODO вынести в env
                key: fs.readFileSync('/etc/letsencrypt/live/unialbums.ru/privkey.pem'),
                cert: fs.readFileSync('/etc/letsencrypt/live/unialbums.ru/fullchain.pem')
            };

            https.createServer(options, app).listen(PORT, () => {
                console.log(`HTTPS сервер запущен на порту ${PORT}`);
            });
        } else {
            // Локальная разработка с HTTP
            app.listen(PORT, () => {
                console.log(`HTTP сервер запущен на порту ${PORT}`);
            });
        }
    } catch (e) {
        console.log(e);
    }
}

start();