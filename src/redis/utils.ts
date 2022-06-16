import getClient from './client';

type ArgValueType = Object | string | number;

export default {
  // 设置
  set: async (key: string, value: ArgValueType, options?: Object) => {
    try {
      const client = await getClient();
      await client.set(
        key,
        typeof value === 'object' ? JSON.stringify(value) : value,
        options ?? { KEEPTTL: true }
      );
    } catch (e: any) {
      throw new Error(e.message);
    }
  },
  // 获取
  get: async (key: string) => {
    let res: string | null = null;
    try {
      const client = await getClient();
      res = await client.get(key);
    } catch (e: any) {
      throw new Error(e.message);
    }
    return res;
  },
  // 删除
  del: async (key: string) => {
    try {
      const client = await getClient();
      await client.del(key);
    } catch (e: any) {
      throw new Error(e.message);
    }
  },
  // 设置TTL
  setTTL: async (key: string, ttl: number) => {
    try {
      const client = await getClient();
      await client.getEx(key, { EX: ttl });
    } catch (e: any) {
      throw new Error(e.message);
    }
  },
  // 获取TTL
  getTTL: async (key: string) => {
    let res: number = 0;
    try {
      const client = await getClient();
      res = await client.ttl(key);
    } catch (e: any) {
      throw new Error(e.message);
    }
    return res;
  },
};
