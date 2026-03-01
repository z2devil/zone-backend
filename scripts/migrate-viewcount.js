const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'zone';

async function migrateViewCount() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log('连接到 MongoDB...');
    await client.connect();
    console.log('连接成功！');

    const db = client.db(DB_NAME);
    const notesCollection = db.collection('notes');

    console.log('开始迁移 viewCount 字段...');

    // 使用聚合管道更新 viewCount
    const result = await notesCollection.updateMany(
      {},
      [
        {
          $set: {
            viewCount: {
              $size: {
                $ifNull: ['$views', []]
              }
            }
          }
        }
      ]
    );

    console.log('迁移完成！');
    console.log(`匹配的文档数: ${result.matchedCount}`);
    console.log(`修改的文档数: ${result.modifiedCount}`);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('数据库连接已关闭');
  }
}

migrateViewCount();
