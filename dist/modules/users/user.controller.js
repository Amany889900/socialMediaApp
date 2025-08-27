"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = __importDefault(require("./user.service"));
const validation_1 = require("../../middleware/validation");
const user_validation_1 = require("./user.validation");
const userRouter = (0, express_1.Router)();
userRouter.post("/signUp", (0, validation_1.Validation)(user_validation_1.signUpSchema), user_service_1.default.signUp);
userRouter.post("/signIn", user_service_1.default.signIn);
exports.default = userRouter;
