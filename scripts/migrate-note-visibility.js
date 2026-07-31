const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;
const shouldApply = process.argv.includes('--apply');

if (!mongoUri) {
  console.error('缺少 MONGO_URI，未连接数据库。');
  process.exit(1);
}

async function migrateNoteVisibility() {
  try {
    await mongoose.connect(mongoUri);
    const notes = mongoose.connection.collection('notes');
    const filter = { visibility: { $exists: false } };
    const count = await notes.countDocuments(filter);

    if (!shouldApply) {
      console.log(`将迁移 ${count} 篇历史笔记；追加 --apply 后才会写入。`);
      return;
    }

    const result = await notes.updateMany(filter, {
      $set: { visibility: 'public' },
    });
    console.log(
      `迁移完成：匹配 ${result.matchedCount}，更新 ${result.modifiedCount}。`
    );
  } finally {
    await mongoose.disconnect();
  }
}

migrateNoteVisibility().catch(error => {
  console.error('迁移失败：', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
