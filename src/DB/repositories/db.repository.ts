import { HydratedDocument, Model, ProjectionType, RootFilterQuery } from "mongoose";
import { AppError } from "../../utils/errorClass";


export abstract class DbRepository<TDocument>{

    constructor(protected readonly model:Model<TDocument>){}

    async create(data:Partial<TDocument>): Promise<HydratedDocument<TDocument>>{
        return this.model.create(data)
    }

    async findOne(filter: RootFilterQuery<TDocument>,select?:ProjectionType<TDocument>): Promise<HydratedDocument<TDocument> | null> {
        return this.model.findOne(filter)
    }

   
}