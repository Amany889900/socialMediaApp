"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: (0, path_1.resolve)("./config/.env") });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const errorClass_1 = require("./utils/errorClass");
const user_controller_1 = __importDefault(require("./modules/users/user.controller"));
const port = process.env.PORT || 5000;
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 5 * 60000,
    limit: 10,
    message: {
        error: "Game over"
    },
    statusCode: 429,
    legacyHeaders: false
});
const bootstrap = () => {
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use(limiter);
    app.use("/users", user_controller_1.default);
    app.get("/", (req, res, next) => {
        return res.status(200).json({ message: "Welcome to the social media app" });
    });
    app.use("{/*demo}", (req, res, next) => {
        // return res.status(404).json({message:`The URL ${req.originalUrl} is not found`});
        // throw new Error(`The URL ${req.originalUrl} is not found`,{cause:404});
        throw new errorClass_1.AppError(`The URL ${req.originalUrl} is not found`, 404);
    });
    app.use((err, req, res, next) => {
        return res.status(err.statusCode || 500).json({ message: err.message, stack: err.stack });
    });
    app.listen(port, () => {
        console.log(`server is running on port ${port}`);
    });
};
exports.default = bootstrap;
