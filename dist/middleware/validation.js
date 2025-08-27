"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = void 0;
const errorClass_1 = require("../utils/errorClass");
const Validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const result = schema[key].safeParse(req[key]);
            if (!result.success) {
                validationErrors.push(result.error);
            }
        }
        if (validationErrors.length) {
            throw new errorClass_1.AppError(JSON.parse(validationErrors), 400);
        }
        next();
    };
};
exports.Validation = Validation;
