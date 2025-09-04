import mongoose from "mongoose";


export const connectionDB = async()=>{
    mongoose.connect(process.env.DB_URL as unknown as string)
    .then(()=>{
        console.log(`success to connect db ${process.env.DB_URL}........`);
    }).catch((error)=>{
        console.log("failed to connect to db.....",error);
    })
}

export default connectionDB