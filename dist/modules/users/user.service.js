"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_validation_1 = require("./user.validation");
class UserService {
    //*************SignUp**************//
    signUp = (req, res, next) => {
        const { name, email, password, cPassword } = req.body;
        user_validation_1.signUpSchema["body"].parse(req.body);
        return res.status(201).json({ message: `Success!!`, body: req.body });
    };
    //*************SignIn**************//
    signIn = (req, res, next) => {
        return res.status(200).json({ message: `Success!!` });
    };
}
// lw hb3t ll class params yb2a a3ml export ll class kolo msh instance mno !!
exports.default = new UserService();
