/**
 * 只读检查：统计 users 集合中未规范化（含大写或首尾空白）的邮箱，
 * 以及规范化后会互相冲突（违反 email 唯一索引）的账号组。
 * 不做任何写入；不输出完整邮箱，仅输出脱敏标识与 _id，供人工决定迁移方案。
 *
 * 用法：MONGO_URI='mongodb://user:pass@host:27017/blog?authSource=admin' node scripts/check-user-email-case.js
 */
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('缺少 MONGO_URI，未连接数据库。');
  process.exit(1);
}

const normalize = email => String(email).trim().toLowerCase();
const mask = email => {
  const [name = '', domain = ''] = normalize(email).split('@');
  return `${name.slice(0, 2)}***@${domain}`;
};

async function checkUserEmailCase() {
  try {
    await mongoose.connect(mongoUri);
    const users = mongoose.connection.collection('users');
    const cursor = users.find({}, { projection: { email: 1, isDeleted: 1 } });

    const groups = new Map();
    let total = 0;
    let unnormalized = 0;
    for await (const user of cursor) {
      total++;
      const key = normalize(user.email);
      if (key !== user.email) unnormalized++;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(user);
    }

    const conflicts = [...groups.entries()].filter(([, list]) => list.length > 1);
    console.log(`用户总数 ${total}，未规范化邮箱 ${unnormalized}，冲突组 ${conflicts.length}。`);
    for (const [key, list] of conflicts) {
      const ids = list
        .map(user => `${user._id}${user.isDeleted ? '(已删除)' : ''}`)
        .join(', ');
      console.log(`冲突 ${mask(key)}: ${ids}`);
    }
    if (unnormalized > 0) {
      console.log(
        '无冲突的记录可执行 updateOne({_id}, {$set: {email: 规范化值}}) 迁移；冲突组需人工合并后再迁移。'
      );
    }
  } finally {
    await mongoose.disconnect();
  }
}

checkUserEmailCase().catch(error => {
  console.error('检查失败：', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
