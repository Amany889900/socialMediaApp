import mongoose, { mongo, Types } from "mongoose";



export interface IRevokeToken {
    userId:Types.ObjectId,
    tokenId:string,
    expiresAt:Date,
}

const revokeTokenSchema = new mongoose.Schema<IRevokeToken>({
    userId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
    tokenId:{type:String,required:true},
    expiresAt:{type:Date,required:true},  
},{
    timestamps:true,
   
})


const revokeTokenModel = mongoose.models.revokeToken || mongoose.model<IRevokeToken>("revokeToken",revokeTokenSchema)

export default revokeTokenModel