import {resolve} from "path";
import {config} from "dotenv";
config({path:resolve("./config/.env")});
import express, { NextFunction, Request, Response } from "express";
const app:express.Application = express();
import cors from "cors";
import helmet from "helmet";
import {rateLimit} from "express-rate-limit"
import { AppError } from "./utils/errorClass";
import userRouter from "./modules/users/user.controller";
import connectionDB from "./DB/connectionDB";
import userModel, { GenderType } from "./DB/model/user.model";
import { v4 as uuidv4 } from "uuid";
import { createGetFilePreSignedUrl, deleteFile, getFile } from "./utils/s3.config";
import {pipeline} from "node:stream";
import {promisify} from "node:util";

const writePipeLine = promisify(pipeline);

const port: string | number = process.env.PORT || 5000;

const limiter = rateLimit({
    windowMs:5*60000,
    limit:10,
    message:{
        error:"Game over"
    },
    statusCode:429,
    legacyHeaders:false
})
const bootstrap = async()=>{

    

    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(limiter);
    await connectionDB();
    app.use("/users",userRouter);

    async function test(){
        const user = new userModel({
            userName:"ahmed ali",
            email:`${uuidv4()}ahmed@gmail.com`,
            password:"1234",
            age:23,
            gender:GenderType.male
        })
        await user.save()
    }

    // test();

    ///////////////////////////////AWS Test///////////////////////////////////


    app.get("/upload/delete/*path",async(req:Request,res:Response,next:NextFunction)=>{
        const {path} = req.params as unknown as {path:string[]};
        const Key = path.join("/");

        const result = await deleteFile({
            Key,
        })

        return res.status(200).json({message:"success",result});
    })
    app.get("/upload/pre-signed/*path",async(req:Request,res:Response,next:NextFunction)=>{
        const {path} = req.params as unknown as {path:string[]};
        const {downloadName} = req.query as {downloadName:string};
        const Key = path.join("/");

        const url = await createGetFilePreSignedUrl({
            Key,
            downloadName:downloadName?downloadName:undefined
        })


        return res.status(200).json({message:"success",url});
    })
    app.get("/upload/*path",async(req:Request,res:Response,next:NextFunction)=>{
        const {path} = req.params as unknown as {path:string[]};
        const {downloadName} = req.query as {downloadName:string};
        const Key = path.join("/");

        const result = await getFile({
            Key
        })

        const stream = result.Body as NodeJS.ReadableStream;
        res.setHeader("Content-Type",result?.ContentType!)
        if(downloadName){
        
            res.setHeader("Content-Disposition",`attachment; filename="${downloadName}"`);

        }
        await writePipeLine(stream,res);

        // return res.status(200).json({message:"success",result});
    })

    

    app.get("/",(req:Request,res:Response,next:NextFunction)=>{
        return res.status(200).json({message:"Welcome to the social media app"});
    })
    app.use("{/*demo}",(req:Request,res:Response,next:NextFunction)=>{
        // return res.status(404).json({message:`The URL ${req.originalUrl} is not found`});
        // throw new Error(`The URL ${req.originalUrl} is not found`,{cause:404});
        throw new AppError(`The URL ${req.originalUrl} is not found`,404)
    })
    app.use((err:AppError,req:Request,res:Response,next:NextFunction)=>{
        return res.status(err.statusCode as unknown as number || 500).json({message:err.message,stack:err.stack});
    })
    app.listen(port,()=>{
        console.log(`server is running on port ${port}`)
    })

}

export default bootstrap