import assert from 'assert';
import NoteModel from '../src/api/models/note.model';
import { getCategories } from '../src/api/service/note.service';

const model = NoteModel as any;

async function run() {
  const original = model.aggregate;
  try {
    let pipeline: any[] = [];
    model.aggregate = (stages: any[]) => {
      pipeline = stages;
      return Promise.resolve([]);
    };
    await getCategories();

    // 分类卡片只展示最新笔记标题，不得通过 $lookup 拉取整篇笔记。
    const noteLookup = pipeline.find(
      stage => stage.$lookup && stage.$lookup.from === 'notes'
    );
    assert.strictEqual(noteLookup, undefined, '不应 $lookup 整篇笔记');

    const group = pipeline.find(stage => stage.$group)?.$group;
    assert.deepStrictEqual(group.latestNote, {
      $last: { _id: '$_id', title: '$title' },
    });

    // 已删除标签不出现在分类中。
    const tagLookup = pipeline.find(
      stage => stage.$lookup && stage.$lookup.from === 'tags'
    )?.$lookup;
    assert.deepStrictEqual(tagLookup, {
      from: 'tags',
      let: { tagId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$_id', '$$tagId'] },
            isDeleted: { $ne: true },
          },
        },
        { $project: { label: 1 } },
      ],
      as: 'tagData',
    });
    // 标签已删除时 tagData 为空，$unwind 会丢弃该分类。
    assert.ok(pipeline.some(stage => stage.$unwind === '$tagData'));

    const project = pipeline.find(stage => stage.$project)?.$project;
    assert.strictEqual(project.latestNote, '$latestNote');
  } finally {
    model.aggregate = original;
  }
}

run()
  .then(() => console.log('note categories contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
