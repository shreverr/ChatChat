import { FilterQuery, Model, Types, UpdateQuery } from "mongoose";
import { AbstractDocument } from "./abstract.schema";
import { Logger, NotFoundException } from "@nestjs/common";

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger

  constructor(protected readonly model: Model<TDocument>) { }

  create = async (document: Omit<TDocument, '_id'>) => {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId()
    })

    return (await createdDocument.save()).toJSON() as unknown as TDocument
  }

  findOne = async (filterQuery: FilterQuery<TDocument>): Promise<TDocument> => {
    const document = await this.model
      .findOne(filterQuery)
      .lean<TDocument>(true)

    if (!document) {
      this.logger.warn('No document was found with FilterQuery', filterQuery)
      throw new NotFoundException('No document found')
    }

    return document
  }

  findOneAndUpdate = async (filterQuery: FilterQuery<TDocument>, update: UpdateQuery<TDocument>): Promise<TDocument> => {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean<TDocument>(true)

    if (!document) {
      this.logger.warn('No document was found with FilterQuery', filterQuery)
      throw new NotFoundException('No document found')
    }

    return document
  }

  find = async (filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> => {
    const document = await this.model
      .find(filterQuery)
      .lean<TDocument[]>(true)

    if (!document) {
      this.logger.warn('No document was found with FilterQuery', filterQuery)
      throw new NotFoundException('No document found')
    }

    return document
  }

  findOneAndDelete = async (filterQuery: FilterQuery<TDocument>): Promise<TDocument> => {
    const document = await this.model
      .findOneAndDelete(filterQuery)
      .lean<TDocument>(true)

    if (!document) {
      this.logger.warn('No document was found with FilterQuery', filterQuery)
      throw new NotFoundException('No document found')
    }

    return document
  }
}
