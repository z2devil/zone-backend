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
   * 写操作的过滤条件：只保留 schema 内且有值的字段。
   * Mongoose 会静默剔除未知字段，若剔除后为空将命中整个集合，因此直接拒绝。
   */
  private requireFilter(query: FilterQuery<document>) {
    const filter: Record<string, unknown> = {};
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value !== undefined && this.DBModel.schema.path(key)) {
        filter[key] = value;
      }
    });
    if (Object.keys(filter).length === 0) {
      throw new Error('缺少有效的过滤条件，拒绝批量写入');
    }
    return filter as FilterQuery<document>;
  }

  /**
   * 新增
   */
  async create(input: Partial<DocumentDefinition<Cdocument>>) {
    return await this.DBModel.create(input);
  }

  /**
   * 新增或修改
   */
  async createOrUpdate(input: Partial<FilterQuery<document>>) {
    const result = await this.DBModel.find({
      _id: input._id,
    });
    if (result.length === 0) {
      return await this.DBModel.create(input);
    } else {
      return await this.DBModel.findByIdAndUpdate(
        input._id,
        {
          label: input.label,
          isDeleted: false,
        },
        {
          new: true,
        }
      );
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
    const filter = this.requireFilter(query);
    return await this.DBModel.updateMany(
      { ...filter, isDeleted: false },
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
    // 从 params 中分离分页参数和查询条件
    const { current, size, ...filter } = params;

    const query = this.DBModel.find<
      document & {
        _id: string;
      }
    >(
      {
        ...filter,
        isDeleted: false,
      },
      projection,
      options
    )
      .skip((current - 1) * size)
      .limit(size);

    const count = this.DBModel.countDocuments({
      ...filter,
      isDeleted: false,
    });

    const [data, dataTotal] = await Promise.all([query, count]);

    return [data, dataTotal] as const;
  }

  /**
   * 删除
   */
  async delete(query: FilterQuery<document>) {
    const filter = this.requireFilter(query);
    return await this.DBModel.updateMany(filter, {
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
