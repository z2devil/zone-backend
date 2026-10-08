import { Request, Response } from 'express';
import { result } from '../common';
import config from '../../constant/settings';
import OSS from 'ali-oss';

const POLICY_TTL_MS = 10 * 60 * 1000;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
/**
 * 需与前端 OSS_ROOT 一致（前端上传 key 为 `${OSS_ROOT}/${fileType}/${filename}`）。
 * TODO: settings.oss['root-path'] 当前为 'blog/' 且未被使用，统一配置后改为读取配置。
 */
const UPLOAD_KEY_PREFIX = 'zone/';

type PolicyCondition = [string, string | number, string | number];

/** 生成前端直传 policy：短有效期、限制大小与上传目录。 */
export const buildUploadPolicy = (now = new Date()) => ({
  expiration: new Date(now.getTime() + POLICY_TTL_MS).toISOString(),
  conditions: [
    ['content-length-range', 1, MAX_UPLOAD_BYTES],
    ['starts-with', '$key', UPLOAD_KEY_PREFIX],
  ] as PolicyCondition[],
});

/**
 * 获取 OSS 直传凭证
 */
export async function getPplicyHandler(req: Request, res: Response) {
  const client = new OSS({
    region: config.oss.endpoint,
    accessKeyId: config.oss['access-key-id'],
    accessKeySecret: config.oss['access-key-secret'],
    bucket: config.oss['bucket-name'],
  });

  const formData = client.calculatePostSignature(buildUploadPolicy());

  return result(res, {
    policy: formData.policy,
    signature: formData.Signature,
    accessKeyId: formData.OSSAccessKeyId,
  });
}
