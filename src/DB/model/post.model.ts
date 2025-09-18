import mongoose, { mongo, Types } from "mongoose";


export interface IPost {
    userId:Types.ObjectId,
    content:string,
    likes:Types.ObjectId[],
}

const postSchema = new mongoose.Schema<IPost>({
   userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
   },
   content:{
    type:String,
    required:true
   },
   likes: {
      type: [mongoose.Schema.Types.ObjectId], 
      ref: "User",            
      default: [],            
    }
},{
    timestamps:true,
   
})


const postModel = mongoose.models.post || mongoose.model<IPost>("post",postSchema)

export default postModel