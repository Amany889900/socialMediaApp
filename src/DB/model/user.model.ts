import mongoose, { Types } from "mongoose";

export enum GenderType  {
    male = "male",
    female = "female"
}

export enum RoleType  {
    user = "user",
    admin = "admin"
}

export enum ProviderType{
    system="system",
    google="google",
}

export interface IUser {
    // _id:Types.ObjectId, est8nena 3no bl hydrated document
    fName:string,
    lName:string,
    userName?:string,
    email:string,
    password:string,
    age:number,
    phone?:string,
    address?:string,
    image?:string,
    confirmed:boolean,
    otp?:string,
    provider:ProviderType,
    changeCredentials?:Date,
    gender:GenderType,
    role?:RoleType,
    deletedAt?:Date
    // createdAt:Date,
    // updatedAt:Date
}

const userSchema = new mongoose.Schema<IUser>({
    fName:{type:String,required:true,minLength:2,maxLength:5,trim:true},
    lName:{type:String,required:true,minLength:2,maxLength:5,trim:true},
    email:{type:String,required:true,unique:true,trim:true},
    password:{type:String,required:function(){
        return this.provider === ProviderType.google ? false:true;
    }},
    age:{type:Number,min:18,max:60,required:function(){
        return this.provider === ProviderType.google ? false:true;
    }},
    phone:{type:String},
    address:{type:String},
    image:{type:String},
    confirmed:{type:Boolean},
    otp:{type:String},
    provider:{type:String, enum:ProviderType, default:ProviderType.system},
    changeCredentials:{type:Date},
    gender:{type:String,enum:GenderType, required:function(){
        return this.provider === ProviderType.google ? false:true;
    }},
    role:{type:String,enum:RoleType,default:RoleType.user},
    deletedAt:{type:Date}
},{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})

userSchema.virtual("userName").set(function(value){
    const [fName,lName] = value.split(" ")
    this.set({fName,lName})
}).get(function(){
    return this.fName + " " + this.lName;
})

userSchema.pre("save",async function(next){
    console.log("-----------------pre save hook-----------")
    console.log(this);
    // next();
})

userSchema.post("save",async function(){
    console.log("-----------------post save hook-----------")
    console.log(this);
})

const userModel = mongoose.models.User || mongoose.model<IUser>("User",userSchema)

export default userModel