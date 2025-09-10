
import { Request } from 'express';
import { HydratedDocument } from 'mongoose';
import { IUser } from '../DB/model/user.model';
import { JwtPayload } from 'jsonwebtoken';

//declaration merging
declare module "express-serve-static-core"{
    interface Request{
        user?:HydratedDocument<IUser>,
        decoded_access_token?:JwtPayload
    }
}