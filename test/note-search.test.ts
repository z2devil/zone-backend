import assert from 'assert';
import NoteModel from '../src/api/models/note.model';
import { findNotes } from '../src/api/service/note.service';

const model = NoteModel as any;

const slate = (text: string) =>
  JSON.stringify([{ type: 'paragraph', children: [{ text }] }]);

async function run() {
  const originals = {
    find: model.find,
    countDocuments: model.countDocuments,
  };

  try {
    let filter: any;
    model.find = (query: unknown) => {
      filter = query;
      const chain: any = Promise.resolve([]);
      chain.skip = () => chain;
      chain.limit = () => chain;
      return chain;
    };
    model.countDocuments = () => Promise.resolve(0);

    const search = async (keyword: string) => {
      await findNotes(
        { search: keyword, current: '1', size: '10' } as any,
        'user-1'
      );
      const [business, scope] = filter.$and;
      // 私密范围仍通过 $and 组合，不被搜索的 $or 覆盖。
      assert.deepStrictEqual(scope.$or[2], {
        visibility: 'private',
        author: 'user-1',
      });
      const fields = business.$or.map((item: any) => Object.keys(item)[0]);
      assert.deepStrictEqual(fields, ['title', 'content']);
      const title: RegExp = business.$or[0].title;
      const content: RegExp = business.$or[1].content;
      return { title, content };
    };

    // 标题：大小写不敏感的子串匹配，元字符被转义。
    const { title } = await search('a.b');
    assert.ok(title.test('xx A.B yy'));
    assert.ok(!title.test('axb'));

    // 正文：只匹配 Slate 文本节点，不匹配 JSON 结构字段。
    const zh = await search('世界');
    assert.ok(zh.content.test(slate('你好世界')));
    const structural = await search('paragraph');
    assert.ok(!structural.content.test(slate('普通文字')));
    const key = await search('text');
    assert.ok(!key.content.test(slate('普通文字')));
    assert.ok(key.content.test(slate('plain TEXT here')));

    // 正文中的引号在 JSON 中被转义，搜索词需按相同方式匹配。
    const quoted = await search('say "hi"');
    assert.ok(quoted.content.test(slate('they say "hi" to me')));
    // 不跨越文本节点边界拼接匹配。
    const cross = await search('ab');
    assert.ok(
      !cross.content.test(
        JSON.stringify([
          { type: 'paragraph', children: [{ text: 'a' }, { text: 'b' }] },
        ])
      )
    );
  } finally {
    model.find = originals.find;
    model.countDocuments = originals.countDocuments;
  }
}

run()
  .then(() => console.log('note search contract: passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
