import { Request, Response } from 'express';
import { result } from '../common';
import config from '../../constant/settings';
import OSS from 'ali-oss';

/**
 * 发送验证码
 */
export async function getPplicyHandler(req: Request, res: Response) {
  const client = new OSS({
    region: config.oss.endpoint,
    accessKeyId: config.oss['access-key-id'],
    accessKeySecret: config.oss['access-key-secret'],
    bucket: config.oss['bucket-name'],
  });

  const date = new Date();
  date.setDate(date.getDate() + 1);
  const policy = {
    expiration: date.toISOString(), // 设置Policy的失效时间，如果超过失效时间，就无法通过此Policy上传文件
    conditions: [
      ['content-length-range', 0, 1048576000], // 设置上传文件的大小设置
    ],
  };

  const formData = client.calculatePostSignature(policy);

  return result(res, {
    policy: formData.policy,
    signature: formData.Signature,
    accessKeyId: formData.OSSAccessKeyId,
  });
}
