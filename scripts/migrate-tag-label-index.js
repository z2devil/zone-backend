const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;
const shouldApply = process.argv.includes('--apply');

const OLD_INDEX = 'label_1';
const NEW_INDEX = 'label_1_active';

if (!mongoUri) {
  console.error('缺少 MONGO_URI，未连接数据库。');
  process.exit(1);
}

/**
 * 将 tags.label 的全局唯一索引替换为仅约束未删除标签的 partial unique index。
 * 默认只读预检；追加 --apply 才会写入。
 */
async function migrateTagLabelIndex() {
  try {
    await mongoose.connect(mongoUri);
    const tags = mongoose.connection.collection('tags');
    const indexes = await tags.indexes();
    const hasOld = indexes.some(index => index.name === OLD_INDEX);
    const hasNew = indexes.some(index => index.name === NEW_INDEX);

    // 新索引要求未删除标签的 label 唯一，先检查是否存在冲突数据
    const duplicates = await tags
      .aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$label', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ])
      .toArray();

    console.log(
      `旧索引 ${OLD_INDEX}：${
        hasOld ? '存在' : '不存在'
      }；新索引 ${NEW_INDEX}：${hasNew ? '存在' : '不存在'}；未删除标签重名 ${
        duplicates.length
      } 组。`
    );

    if (duplicates.length > 0) {
      console.error('存在未删除的重名标签，请先人工处理后再迁移。');
      process.exitCode = 1;
      return;
    }

    if (!shouldApply) {
      console.log('预检完成；追加 --apply 后才会修改索引。');
      return;
    }

    if (!hasNew) {
      await tags.createIndex(
        { label: 1 },
        {
          name: NEW_INDEX,
          unique: true,
          partialFilterExpression: { isDeleted: false },
        }
      );
      console.log(`已创建 ${NEW_INDEX}。`);
    }

    if (hasOld) {
      await tags.dropIndex(OLD_INDEX);
      console.log(`已删除 ${OLD_INDEX}。`);
    }

    console.log('迁移完成。');
  } finally {
    await mongoose.disconnect();
  }
}

migrateTagLabelIndex().catch(error => {
  console.error('迁移失败：', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
