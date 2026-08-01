import assert from 'assert';
import { Writable } from 'stream';
import { createLogger, maskIdentifier } from '../src/observability/logger';
import {
  resolveRequestId,
  REQUEST_ID_HEADER,
} from '../src/observability/request';

assert.strictEqual(
  maskIdentifier('user-1'),
  maskIdentifier('user-1'),
  '同一用户必须生成稳定的日志标识'
);
assert.notStrictEqual(maskIdentifier('user-1'), 'user-1');
assert.notStrictEqual(maskIdentifier('user-1'), maskIdentifier('user-2'));
assert.strictEqual(maskIdentifier(''), '');

assert.strictEqual(resolveRequestId('web_123'), 'web_123');
assert.notStrictEqual(resolveRequestId('包含空格'), '包含空格');
assert.notStrictEqual(resolveRequestId('x'.repeat(65)), 'x'.repeat(65));
assert.strictEqual(REQUEST_ID_HEADER, 'X-Request-ID');

let output = '';
const destination = new Writable({
  write(chunk, _encoding, callback) {
    output += chunk.toString();
    callback();
  },
});
const testLogger = createLogger(destination);
testLogger.info(
  {
    event: 'privacy_contract_checked',
    token: 'secret-token',
    email: 'private@example.com',
    req: {
      headers: { authorization: 'Bearer secret' },
      body: { title: '私密标题', content: '私密正文' },
    },
  },
  'privacy contract'
);

const event = JSON.parse(output);
assert.strictEqual(event.event, 'privacy_contract_checked');
assert.strictEqual(event.service, 'zone-backend');
assert.strictEqual(event.token, '[REDACTED]');
assert.strictEqual(event.email, '[REDACTED]');
assert.strictEqual(event.req.headers.authorization, '[REDACTED]');
assert.strictEqual(event.req.body, '[REDACTED]');
assert.ok(!output.includes('secret-token'));
assert.ok(!output.includes('private@example.com'));
assert.ok(!output.includes('私密标题'));
assert.ok(!output.includes('私密正文'));

console.log('observability contract: passed');
