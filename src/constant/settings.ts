export default {
  // 端口号
  port: 2333,
  // 数据库相关
  db: {
    uri: 'mongodb://***REMOVED***:27017/blog',
    user: 'admin',
    password: '***REMOVED***',
    source: 'admin',
  },
  // redis相关
  redis: {
    port: 6379,
    host: '***REMOVED***',
    db: 3,
    password: '***REMOVED***',
  },
  // oss相关
  oss: {
    endpoint: 'oss-cn-beijing.aliyuncs.com',
    'access-key-id': '***REMOVED***',
    'access-key-secret': '***REMOVED***',
    'bucket-name': 'z2devil-bucket',
    'root-path': 'blog/',
  },
  // 邮箱相关
  mail: {
    host: 'smtp.qq.com',
    username: 'user@example.com',
    password: '***REMOVED***',
  },
  // 认证相关
  auth: {
    // 请求头名称
    header: 'authorization',
    // 验证码前缀 在redis中存储数据的key前缀，例：code-user@example.com
    'code-prefix': 'code-',
    // token前缀 在redis中存储数据的key前缀，例：token-1
    'token-prefix': 'token-',
    // 验证码发送冷却时间 此处单位/秒 ，可在此网站生成 https://www.convertworld.com/zh-hans/time/milliseconds.html
    'code-cooling-time': 60,
    // 验证码过期时间
    'code-expire-time': 900,
    // 验证码长度
    'code-length': 4,
    // 验证码生命条数
    'code-life-number': 3,
    // 验证码过期时间
    'token-expire-time': 2592000,
    // token 续期检查时间范围 在token即将过期的一段时间内用户操作了，则给用户的token续期
    'token-detect-scope': 172800,
    // token秘钥
    'token-secret': '***REMOVED***',
  },
};
