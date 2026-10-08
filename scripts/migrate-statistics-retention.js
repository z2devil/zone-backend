const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;
const shouldApply = process.argv.includes('--apply');

if (!mongoUri) {
  console.error('缺少 MONGO_URI，未连接数据库。');
  process.exit(1);
}

/**
 * 统计改为按小时 upsert 并通过 collectedAt TTL 保留 90 天。
 * 历史文档没有 collectedAt，不会被 TTL 清理：按 createdAt 回填后由 TTL 自动删除过期数据。
 */
async function migrateStatisticsRetention() {
  try {
    await mongoose.connect(mongoUri);
    const statistics = mongoose.connection.collection('statistics');
    const filter = { collectedAt: { $exists: false } };
    const count = await statistics.countDocuments(filter);

    if (!shouldApply) {
      console.log(
        `将为 ${count} 条历史统计回填 collectedAt；追加 --apply 后才会写入。`
      );
      return;
    }

    const result = await statistics.updateMany(filter, [
      { $set: { collectedAt: { $toDate: '$createdAt' } } },
    ]);
    console.log(
      `迁移完成：匹配 ${result.matchedCount}，更新 ${result.modifiedCount}。`
    );
  } finally {
    await mongoose.disconnect();
  }
}

migrateStatisticsRetention().catch(error => {
  console.error('迁移失败：', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
