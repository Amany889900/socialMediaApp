"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../../DB/model/user.model"));
const errorClass_1 = require("../../utils/errorClass");
const user_repository_1 = require("../../DB/repositories/user.repository");
const hash_1 = require("../../utils/hash");
const events_1 = require("../../utils/events");
class UserService {
    // private _userModel:Model<IUser> = userModel
    _userModel = new user_repository_1.UserRepository(user_model_1.default);
    //*************SignUp**************//
    signUp = async (req, res, next) => {
        const { userName, email, password, cPassword, age, address, phone, gender } = req.body;
        if (await this._userModel.findOne({ email })) {
            throw new errorClass_1.AppError("Email already exists", 409);
        }
        const hash = await (0, hash_1.Hash)(password);
        const user = await this._userModel.createOneUser({ userName, email, password: hash, age, address, phone, gender });
        events_1.eventEmitter.emit("confirmEmail", { email });
        return res.status(201).json({ message: `Success!!`, user });
    };
    //*************SignIn**************//
    signIn = (req, res, next) => {
        return res.status(200).json({ message: `Success!!` });
    };
}
// lw hb3t ll class params yb2a a3ml export ll class kolo msh instance mno !!
exports.default = new UserService();
