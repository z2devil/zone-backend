import { Express } from 'express';
import { AddressInfo } from 'net';

export async function withServer(
  app: Express,
  run: (baseURL: string) => Promise<void>
) {
  const server = app.listen(0);
  await new Promise<void>(resolve => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  }
}

/**
 * 替换邮件发送，避免测试连接真实 SMTP
 */
export function stubMailer(impl: () => Promise<void> = async () => undefined) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mailer = require('../../src/utils/emailUtil').default;
  const sent: string[] = [];
  mailer.send = async (to: string) => {
    sent.push(to);
    await impl();
  };
  return sent;
}
