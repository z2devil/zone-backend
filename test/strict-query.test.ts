import assert from 'assert';
import { Model } from 'mongoose';
import NoteModel from '../src/api/models/note.model';
import TagModel from '../src/api/models/tag.model';
import UserModel from '../src/api/models/user.model';
import RoleModel from '../src/api/models/role.model';
import PermissionModel from '../src/api/models/permission.model';
import StatisticsModel from '../src/api/models/statistics.model';

/** 只做查询条件转换，不连接数据库。 */
const castFilter = (model: Model<any>, filter: Record<string, unknown>) =>
  model.find(filter).cast(model);

function run() {
  const models: Model<any>[] = [
    NoteModel,
    TagModel,
    UserModel,
    RoleModel,
    PermissionModel,
    StatisticsModel,
  ];

  // Mongoose 7 起 strictQuery 默认 false；本仓库依赖 6.x 剔除 schema 外字段的行为。
  for (const model of models) {
    assert.deepStrictEqual(
      castFilter(model, { current: 1, size: 10, unknownField: 'x' }),
      {},
      `${model.modelName}: 分页参数与未知字段必须被剔除`
    );
    assert.deepStrictEqual(
      castFilter(model, { unknownField: 'x', isDeleted: false }),
      { isDeleted: false },
      `${model.modelName}: schema 内字段保留`
    );
  }

  // $and/$or 内的未知字段同样剔除（笔记可见范围通过 $and 组合）。
  assert.deepStrictEqual(
    castFilter(NoteModel, {
      $and: [
        { isDeleted: false, current: 1 },
        { $or: [{ visibility: 'public' }, { title: 'a', unknown: 1 }] },
      ],
    }),
    {
      $and: [
        { isDeleted: false },
        { $or: [{ visibility: 'public' }, { title: 'a' }] },
      ],
    }
  );

  // 隐式子文档 schema 继承 strictQuery。
  assert.deepStrictEqual(
    castFilter(StatisticsModel, { 'contributes.unknown': 1 }),
    {}
  );
}

try {
  run();
  console.log('strict query contract: passed');
} catch (error) {
  console.error(error);
  process.exit(1);
}
