"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DATABASE_URL = process.env.DATABASEURL || '';
const config = {
    mongo: {
        options: {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            socketTimeoutMS: 30000,
            autoIndex: false
        },
        url: DATABASE_URL
    },
    server: {
        host: 'localhost',
        port: process.env.PORT
    }
};
exports.default = config;
//# sourceMappingURL=config.js.map