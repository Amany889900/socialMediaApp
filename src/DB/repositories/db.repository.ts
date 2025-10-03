import { DeleteResult, HydratedDocument, Model, MongooseBulkSaveOptions, MongooseBulkWriteResult, ProjectionType, QueryOptions, RootFilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";
import { AppError } from "../../utils/errorClass";


export abstract class DbRepository<TDocument>{

    constructor(protected readonly model:Model<TDocument>){}

    async create(data:Partial<TDocument>): Promise<HydratedDocument<TDocument>>{
        return this.model.create(data)
    }

    async findOne(filter: RootFilterQuery<TDocument>,select?:ProjectionType<TDocument>,options?:QueryOptions<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOne(filter,select,options)
    }

    // 7wlna el positional params l named 3shan n3rf nb3t options mn 8eir select bdl manb3t undefined
    async find({filter,select,options}:{filter:RootFilterQuery<TDocument>,select?:ProjectionType<TDocument>,options?:QueryOptions<TDocument>}):Promise<HydratedDocument<TDocument>[]>{
        return this.model.find(filter,select,options);
    }

    async paginate({filter,query,select,options}:{filter:RootFilterQuery<TDocument>,query:{page:number, limit:number},select?:ProjectionType<TDocument>,options?:QueryOptions<TDocument>}){
         let {page,limit} = query
        if(page<0) page=1;
         page=page*1 || 1 // 3shan a7wlha l number w lw mb3tsh hyb2a undefined f undefined * 1 => NaN f hya5od el 1
         // leh m3mlnash Number(page) w 5las 3shan yrg3 el NaN

         const skip = (page-1)*limit;

         const finalOptions={
            ...options,
            skip,
            limit,
         }
       
        const count = await this.model.countDocuments({deletedAt:{$exists:false}});
        console.log(count);
        const numOfPages = Math.ceil(count/limit);
        // estimatedDocumentCount msh bta5od condition bt3d kolo w 5las
        const docs = await this.model.find(filter,select,finalOptions);
        return {docs,currentPage:page,countDocuments:count,numOfPages};
    }

    async findOneAndUpdate(filter: RootFilterQuery<TDocument>,update:UpdateQuery<TDocument>,options:QueryOptions<TDocument> | null = {new:true}): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOneAndUpdate(filter,update,options)
    }

    async updateOne(filter: RootFilterQuery<TDocument>,update:UpdateQuery<TDocument>): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(filter,update)
    }   

    async bulkSave(documents: Array<HydratedDocument<TDocument>>, options?: MongooseBulkSaveOptions): Promise<MongooseBulkWriteResult>{
        return await this.model.bulkSave(documents,options);
    }

     async deleteOne(filter: RootFilterQuery<TDocument>): Promise<DeleteResult> {
        return await this.model.deleteOne(filter)
    }
}