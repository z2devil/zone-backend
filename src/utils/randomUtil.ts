export default {
  // 昵称
  nickname: () => {
    let res = '';
    res += wordsLibrary[0][~~(Math.random() * wordsLibrary[0].length)];
    res += wordsLibrary[1][~~(Math.random() * wordsLibrary[1].length)];
    res += wordsLibrary[2][~~(Math.random() * wordsLibrary[2].length)];
    return res;
  },
  // 头像地址
  avatarPath: () => {
    return avatarPathLibrary[~~(Math.random() * avatarPathLibrary.length)];
  },
  // 验证码
  CAPTCHA: (length: number = 4) => {
    const chars = '1234567890';
    let res = '';
    let len = chars.length - 1;
    let idx;
    for (let i = 0; i < length; i++) {
      idx = Math.random() * len;
      res = res + chars.charAt(idx);
    }
    return res;
  },
};

/**
 * 昵称词库
 */
const wordsLibrary = [
  [
    '勇敢',
    '聪明',
    '机智',
    '善良',
    '潇洒',
    '美丽',
    '无敌',
    '可爱',
    '真正',
    '完美',
    '迷人',
    '乐观',
    '奇妙',
    '动人',
    '伟大',
    '幸福',
  ],
  ['的', '之'],
  [
    '狼',
    '熊',
    '龙',
    '虎',
    '橘猫',
    '麻雀',
    '长颈鹿',
    '狮子',
    '树懒',
    '金丝猴',
    '考拉',
    '穿山甲',
    '犀牛',
    '猩猩',
    '水獭',
    '熊猫',
    '树懒',
    '袋鼠',
    '北极熊',
    '刺猬',
    '河马',
    '鲸鱼',
    '鲶鱼',
    '章鱼',
    '泥鳅',
    '金枪鱼',
    '鳄鱼',
    '鲤鱼',
    '鲑鱼',
    '鲤鱼',
    '老鹰',
    '白鹭',
    '企鹅',
    '啄木鸟',
    '鸵鸟',
    '天鹅',
    '信天翁',
    '海鸥',
    '鸸鹋',
    '蝴蝶',
    '蜻蜓',
    '隼',
    '白金之星',
  ],
];

/**
 * 头像地址库
 */
const avatarPathLibrary = [
  'blog/image/beff616b-a28b-489a-83b0-3df3938bcedf.jpg',
  'blog/image/2a0d1792-8539-46f9-8403-d94d7b4bc80b.jpg',
];
