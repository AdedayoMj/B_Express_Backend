import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import logging from './config/logging';

import mongoose from 'mongoose';
import cors from 'cors';
import config from './config/config';
import expenseRoutes from './routes/expense';

const app = express();
const PORT = process.env.PORT || 6000;

/** Server Handling */
const httpServer = http.createServer(app);

/**allow cors */
app.use(cors());

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then((result) => {
        logging.info('Mongodb is Connected');
    })
    .catch((error) => {
        logging.error(error);
    });

/** Log the request */
app.use((req, res, next) => {
    logging.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        logging.info(`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Parse the body of the request */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

/** Routes */
app.use('/expense', expenseRoutes);

/** Listen */
httpServer.listen(process.env.PORT || 5050, () => logging.info(`Server is running ${config.server.host}:${process.env.PORT}`));
