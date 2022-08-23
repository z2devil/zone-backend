import {
  FilterQuery,
  UpdateQuery,
  DocumentDefinition,
  QueryOptions,
  Model,
} from 'mongoose';

class BaseCrudProviderCls<document, Cdocument> {
  private DBModel: Model<document>;

  constructor(DBModel: Model<document>) {
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
    const result = await this.DBModel.find(input as FilterQuery<document>);
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
    const finalOptions = { ...options };
    if (query.current) {
      finalOptions.skip = query.current * query.size;
      finalOptions.limit = query.size;
    }
    const result = await this.DBModel.find<
      document & {
        _id: string;
      }
    >(
      {
        ...query,
        isDeleted: false,
      },
      projection,
      finalOptions
    );
    return result;
  }

  /**
   * 查询单个
   */
  async findOne(
    query: FilterQuery<document>,
    projection?: any,
    options?: QueryOptions
  ) {
    return await this.DBModel.findOne<
      document & {
        _id: string;
      }
    >(
      {
        ...query,
        isDeleted: false,
      },
      projection,
      options
    );
  }

  /**
   * 分页查询
   */
  async findPaginate(
    params: FilterQuery<document>,
    projection?: any,
    options?: QueryOptions
  ) {
    const query = this.DBModel.find<
      document & {
        _id: string;
      }
    >(
      {
        ...params,
        isDeleted: false,
      },
      projection,
      options
    )
      .skip((params.current - 1) * params.size)
      .limit(params.size);

    const count = this.DBModel.count({
      ...params,
      isDeleted: false,
    });

    const [data, dataTotal] = await Promise.all([query, count]);

    return [data, dataTotal] as const;
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

const BaseCrudProvider = function <document, Cdocument>(
  DBModel: Model<document>
) {
  const CRUD = new BaseCrudProviderCls<document, Cdocument>(DBModel);

  return {
    create: CRUD.create.bind(CRUD),
    createOrUpdate: CRUD.createOrUpdate.bind(CRUD),
    update: CRUD.update.bind(CRUD),
    find: CRUD.find.bind(CRUD),
    findOne: CRUD.findOne.bind(CRUD),
    findPaginate: CRUD.findPaginate.bind(CRUD),
    delete: CRUD.delete.bind(CRUD),
  };
};

export { BaseCrudProvider };
