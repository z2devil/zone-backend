import assert from 'assert';
import NoteModel from '../src/api/models/note.model';
import {
  findNote,
  removeNote,
  updateNote,
  viewNote,
} from '../src/api/service/note.service';

const model = NoteModel as any;

async function run() {
  const originals = {
    findOne: model.findOne,
    findOneAndUpdate: model.findOneAndUpdate,
    updateOne: model.updateOne,
  };

  try {
    let query: any;
    let findOptions: any;
    model.findOne = (filter: unknown, _projection: unknown, options: any) => {
      query = filter;
      findOptions = options;
      return Promise.resolve(null);
    };
    await findNote({ _id: 'note-1' } as any, 'user-1');
    // 作者信息只暴露公开字段，不返回邮箱与角色等级。
    const authorPopulate = findOptions.populate.find(
      (item: any) => item.path === 'author'
    );
    assert.deepStrictEqual(authorPopulate.select, ['nickname', 'avatarPath']);
    assert.deepStrictEqual(query, {
      $and: [
        { _id: 'note-1', isDeleted: false },
        {
          $or: [
            { visibility: 'public' },
            { visibility: { $exists: false } },
            { visibility: 'private', author: 'user-1' },
          ],
        },
      ],
    });

    let updateQuery: any;
    model.findOneAndUpdate = (filter: unknown) => {
      updateQuery = filter;
      return Promise.resolve(null);
    };
    await updateNote('note-1', 'user-1', { title: 'updated' } as any);
    assert.deepStrictEqual(updateQuery, {
      _id: 'note-1',
      author: 'user-1',
      isDeleted: false,
    });

    let removeQuery: any;
    model.updateOne = (filter: unknown) => {
      removeQuery = filter;
      return Promise.resolve(null);
    };
    await removeNote('note-1', 'user-1');
    assert.deepStrictEqual(removeQuery, {
      _id: 'note-1',
      author: 'user-1',
      isDeleted: false,
    });

    let viewQuery: any;
    model.updateOne = (filter: unknown) => {
      viewQuery = filter;
      return Promise.resolve(null);
    };
    await viewNote({ _id: 'note-1', ip: '127.0.0.1' } as any);
    assert.deepStrictEqual(viewQuery, {
      $and: [
        {
          _id: 'note-1',
          views: { $ne: '127.0.0.1' },
          isDeleted: false,
        },
        {
          $or: [{ visibility: 'public' }, { visibility: { $exists: false } }],
        },
      ],
    });
  } finally {
    model.findOne = originals.findOne;
    model.findOneAndUpdate = originals.findOneAndUpdate;
    model.updateOne = originals.updateOne;
  }
}

run()
  .then(() => console.log('note service contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
