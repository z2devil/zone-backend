/**
 * 进程内的 Redis 替身，只实现认证相关用到的命令，语义对齐 node-redis v4。
 */
interface Entry {
  value: string;
  expiresAt?: number;
}

interface SetOptions {
  EX?: number;
  NX?: boolean;
  KEEPTTL?: boolean;
}

export class FakeRedis {
  private store = new Map<string, Entry>();
  now = Date.now();
  failing = false;

  private read(key: string) {
    this.guard();
    const entry = this.store.get(key);
    if (entry?.expiresAt !== undefined && entry.expiresAt <= this.now) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  private guard() {
    if (this.failing) throw new Error('fake redis unavailable');
  }

  advance(seconds: number) {
    this.now += seconds * 1000;
  }

  keys() {
    return Array.from(this.store.keys()).filter(key => this.read(key));
  }

  async get(key: string) {
    return this.read(key)?.value ?? null;
  }

  async set(key: string, value: string, options: SetOptions = {}) {
    const existing = this.read(key);
    if (options.NX && existing) return null;
    const expiresAt = options.EX
      ? this.now + options.EX * 1000
      : options.KEEPTTL
      ? existing?.expiresAt
      : undefined;
    this.store.set(key, { value: String(value), expiresAt });
    return 'OK';
  }

  async del(keys: string | string[]) {
    let count = 0;
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      if (this.read(key)) count++;
      this.store.delete(key);
    }
    return count;
  }

  async incr(key: string) {
    const entry = this.read(key);
    const value = Number(entry?.value ?? 0) + 1;
    this.store.set(key, { value: String(value), expiresAt: entry?.expiresAt });
    return value;
  }

  async expire(key: string, seconds: number) {
    const entry = this.read(key);
    if (!entry) return false;
    entry.expiresAt = this.now + seconds * 1000;
    return true;
  }

  async ttl(key: string) {
    const entry = this.read(key);
    if (!entry) return -2;
    if (entry.expiresAt === undefined) return -1;
    return Math.ceil((entry.expiresAt - this.now) / 1000);
  }
}

/**
 * 用 FakeRedis 替换 src/redis/client 的默认导出。
 */
export function installFakeRedis() {
  const fake = new FakeRedis();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const clientModule = require('../../src/redis/client');
  clientModule.default = async () => fake;
  clientModule.isRedisReady = () => !fake.failing;
  return fake;
}
