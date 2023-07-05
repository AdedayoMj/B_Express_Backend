"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const logging_1 = __importDefault(require("./config/logging"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config/config"));
const expense_1 = __importDefault(require("./routes/expense"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 6000;
/** Server Handling */
const httpServer = http_1.default.createServer(app);
/**allow cors */
app.use((0, cors_1.default)());
/** Connect to Mongo */
mongoose_1.default
    .connect(config_1.default.mongo.url, config_1.default.mongo.options)
    .then((result) => {
    logging_1.default.info('Mongodb is Connected');
})
    .catch((error) => {
    logging_1.default.error(error);
});
/** Log the request */
app.use((req, res, next) => {
    logging_1.default.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
    res.on('finish', () => {
        logging_1.default.info(`METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });
    next();
});
/** Parse the body of the request */
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
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
app.use('/expense', expense_1.default);
/** Listen */
httpServer.listen(process.env.PORT || 5050, () => logging_1.default.info(`Server is running ${config_1.default.server.host}:${process.env.PORT}`));
//# sourceMappingURL=server.js.map