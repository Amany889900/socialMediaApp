import { DeleteResult, HydratedDocument, Model, MongooseBulkSaveOptions, MongooseBulkWriteResult, ProjectionType, QueryOptions, RootFilterQuery, UpdateQuery, UpdateWriteOpResult } from "mongoose";
import { AppError } from "../../utils/errorClass";


export abstract class DbRepository<TDocument>{

    constructor(protected readonly model:Model<TDocument>){}

    async create(data:Partial<TDocument>): Promise<HydratedDocument<TDocument>>{
        return this.model.create(data)
    }

    async findOne(filter: RootFilterQuery<TDocument>,select?:ProjectionType<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOne(filter)
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