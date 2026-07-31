interface AuthUser {
  _id: unknown;
  email: string;
  lv: number;
  nickname: string;
  avatarPath: string;
}

export const toAuthUserInfo = (user: AuthUser) => ({
  _id: String(user._id),
  email: user.email,
  lv: user.lv,
  nickname: user.nickname,
  avatarPath: user.avatarPath,
});
