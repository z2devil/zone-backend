type Env = Record<string, string | undefined>;

/**
 * 必须通过环境变量注入的密钥，生产环境缺失任意一项都拒绝启动。
 * 变量说明见仓库根目录 .env.example。
 */
export const REQUIRED_SECRET_ENV = [
  'MONGO_PASSWORD',
  'REDIS_PASSWORD',
  'OSS_ACCESS_KEY_ID',
  'OSS_ACCESS_KEY_SECRET',
  'SMTP_PASSWORD',
  'JWT_SECRET',
  'AI_API_KEY',
] as const;

// 仅用于本地开发与测试，生产环境必须注入 JWT_SECRET
const DEV_ONLY_TOKEN_SECRET = 'zone-dev-only-token-secret';

export function loadSettings(env: Env = process.env) {
  const isProduction = env.NODE_ENV === 'production';
  const missing = REQUIRED_SECRET_ENV.filter(name => !env[name]);
  if (isProduction && missing.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
  }
  const secret = (name: (typeof REQUIRED_SECRET_ENV)[number]) =>
    env[name] || '';

  return {
    // 端口号
    port: 2333,
    // 数据库相关
    db: {
      uri: 'mongodb://mongodb:27017/blog',
      user: 'root',
      password: secret('MONGO_PASSWORD'),
      source: 'admin',
    },
    // redis相关
    redis: {
      port: 6379,
      host: 'redis',
      db: 0,
      password: secret('REDIS_PASSWORD'),
    },
    // oss相关
    oss: {
      endpoint: 'oss-cn-beijing',
      'access-key-id': secret('OSS_ACCESS_KEY_ID'),
      'access-key-secret': secret('OSS_ACCESS_KEY_SECRET'),
      'bucket-name': 'z2devil-bucket',
      'root-path': 'blog/',
    },
    // 邮箱相关
    mail: {
      host: 'smtp.qq.com',
      username: 'user@example.com',
      password: secret('SMTP_PASSWORD'),
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
      'token-secret':
        env.JWT_SECRET || (isProduction ? '' : DEV_ONLY_TOKEN_SECRET),
    },
    // AI 相关
    ai: {
      baseURL: '***REMOVED***',
      apiKey: secret('AI_API_KEY'),
      model: 'deepseek-chat',
    },
  };
}

export default loadSettings();
