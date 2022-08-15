import {
  FilterQuery,
  UpdateQuery,
  DocumentDefinition,
  QueryOptions,
  Model,
} from 'mongoose';

class BaseCrudProviderCls<document, Cdocument> {
  private DBModel: Model<any>;

  constructor(DBModel: Model<any>) {
    this.DBModel = DBModel;
  }

  /**
   * 新增
   */
  async create(input: DocumentDefinition<Cdocument>) {
    const data = await this.DBModel.create(input);
    return data.toJSON();
  }

  /**
   * 新增或修改
   */
  async createOrUpdate(input: DocumentDefinition<Cdocument>) {
    const result = await this.DBModel.find(input);
    if (result.length === 0) {
      const data = await this.DBModel.create(input);
      return data.toJSON();
    } else {
      return await this.DBModel.where(input).updateMany({
        ...input,
        isDeleted: false,
      });
    }
  }

  /**
   * 修改
   */
  async update(
    query: FilterQuery<document>,
    update: UpdateQuery<document>,
    options?: QueryOptions
  ) {
    return await this.DBModel.where(query).updateMany(
      {
        ...update,
        updatedAt: Date.now(),
      },
      options
    );
  }

  /**
   * 查询
   */
  async find(
    query: FilterQuery<document>,
    projection?: any,
    options?: QueryOptions
  ) {
    const result = await this.DBModel.find(
      {
        ...query,
        isDeleted: false,
      },
      projection,
      options
    );
    return result && result.map(d => d.toJSON());
  }

  /**
   * 查询单个
   */
  async findOne(
    query: FilterQuery<document>,
    projection?: any,
    options?: QueryOptions
  ) {
    return await this.DBModel.findOne(
      {
        ...query,
        isDeleted: false,
      },
      projection,
      options
    );
  }

  /**
   * 删除
   */
  async delete(query: FilterQuery<document>) {
    return await this.DBModel.where(query).updateMany({
      updatedAt: Date.now(),
      isDeleted: true,
    });
  }
}

const BaseCrudProvider = function <document, Cdocument>(DBModel: Model<any>) {
  const CRUD = new BaseCrudProviderCls<document, Cdocument>(DBModel);

  return {
    create: CRUD.create.bind(CRUD),
    createOrUpdate: CRUD.createOrUpdate.bind(CRUD),
    update: CRUD.update.bind(CRUD),
    find: CRUD.find.bind(CRUD),
    findOne: CRUD.findOne.bind(CRUD),
    delete: CRUD.delete.bind(CRUD),
  };
};

export { BaseCrudProvider };
