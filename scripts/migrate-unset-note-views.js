const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;
const shouldApply = process.argv.includes('--apply');

if (!mongoUri) {
  console.error('缺少 MONGO_URI，未连接数据库。');
  process.exit(1);
}

/** 浏览量去重已改用 Redis，移除笔记文档中历史累积的访客 IP 数组。 */
async function unsetNoteViews() {
  try {
    await mongoose.connect(mongoUri);
    const notes = mongoose.connection.collection('notes');
    const filter = { views: { $exists: true } };
    const count = await notes.countDocuments(filter);

    if (!shouldApply) {
      console.log(
        `将移除 ${count} 篇笔记的 views 字段；追加 --apply 后才会写入。`
      );
      return;
    }

    const result = await notes.updateMany(filter, { $unset: { views: '' } });
    console.log(
      `迁移完成：匹配 ${result.matchedCount}，更新 ${result.modifiedCount}。`
    );
  } finally {
    await mongoose.disconnect();
  }
}

unsetNoteViews().catch(error => {
  console.error('迁移失败：', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
