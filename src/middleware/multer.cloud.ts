import multer, { FileFilterCallback } from "multer"
import { AppError } from "../utils/errorClass";
import { Request } from "express";
import os from "node:os";
import { v4 as uuidv4 } from "uuid";



export const fileValidation = {
    image:["image/png","image/jpg","image/jpeg"],
    video:["video/mp4"],
    audio:["audio/mpeg","audio/mp3"],
    file:["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
}
export enum StorageEnum{
    disk="disk",
    cloud="cloud"
}

export const multerCloud = ({
  fileTypes = fileValidation.image,
  storeType = StorageEnum.cloud,
  maxSize = 5
}:{
    fileTypes?:string[],
    storeType?:StorageEnum,
    maxSize?:number
})=>{

    const storage = storeType===StorageEnum.cloud ? multer.memoryStorage():multer.diskStorage({
        destination: os.tmpdir(),
        filename(req:Request,file:Express.Multer.File,cb){
           cb(null,`${uuidv4()}_${file.originalname}`)
        }
    });

    const fileFilter = (req:Request,file:Express.Multer.File,cb:FileFilterCallback) =>{
        if(fileTypes.includes(file.mimetype)){
            cb(null,true);
        }
        else{
            return cb(new AppError("Invalid file type",400))
        }
    };

    const upload = multer({storage,limits:{fileSize:1024*1024*maxSize},fileFilter});
    return upload
}