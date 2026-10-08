import assert from 'assert';
import { BaseCrudProvider } from '../src/api/common';
import RoleModel from '../src/api/models/role.model';

const model = RoleModel as any;

async function expectRejected(promise: Promise<unknown>, label: string) {
  await assert.rejects(promise, /过滤条件/, label);
}

async function run() {
  const originals = { updateMany: model.updateMany, where: model.where };
  const calls: unknown[] = [];
  const record = (filter: unknown) => {
    calls.push(filter);
    return Promise.resolve({ modifiedCount: 0 });
  };
  model.updateMany = record;
  model.where = (filter: unknown) => ({ updateMany: () => record(filter) });

  try {
    const crud = BaseCrudProvider(RoleModel);

    // 空条件、仅分页参数、仅未知字段、值为 undefined：都会被 Mongoose 视为空条件，必须拒绝
    const emptyFilters: Array<Record<string, unknown>> = [
      {},
      { current: 1, size: 10 },
      { unknownField: 'x' },
      { _id: undefined },
    ];
    for (const filter of emptyFilters) {
      await expectRejected(
        crud.delete(filter as any),
        `delete ${JSON.stringify(filter)}`
      );
      await expectRejected(
        crud.update(filter as any, { name: 'n' }),
        `update ${JSON.stringify(filter)}`
      );
    }
    assert.strictEqual(calls.length, 0, '空条件不得触发写操作');

    // 有效条件：只保留 schema 内字段
    await crud.delete({ _id: 'role-1', current: 1 } as any);
    assert.deepStrictEqual(calls.pop(), { _id: 'role-1' });

    await crud.update({ _id: 'role-1' } as any, { name: 'n' });
    assert.deepStrictEqual(calls.pop(), { _id: 'role-1', isDeleted: false });
  } finally {
    model.updateMany = originals.updateMany;
    model.where = originals.where;
  }
}

run()
  .then(() => console.log('crud provider guard: passed'))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
