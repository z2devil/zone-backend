import assert from 'assert';
import { toAuthUserInfo } from '../src/api/controller/auth.presenter';

assert.deepStrictEqual(
  toAuthUserInfo({
    _id: 'user-1',
    email: 'preview@zone.local',
    lv: 2,
    nickname: '预览账号',
    avatarPath: '/avatar.png',
  }),
  {
    _id: 'user-1',
    email: 'preview@zone.local',
    lv: 2,
    nickname: '预览账号',
    avatarPath: '/avatar.png',
  }
);

console.log('auth presenter contract: passed');
