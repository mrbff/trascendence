export interface UserInfo {
  Wins: number;
  Losses: number;
  Played: number;
  createdAt: string;
  email: string;
  hash: string;
  hashedRt: string;
  id: string;
  img: string;
  is2faEnabled: boolean;
  isOnline: boolean;
  isPlaying: boolean;
  matchHistory: any[];
  qrcode2fa: string;
  secret2fa: string;
  updatedAt: string;
  username: string;
  allRead: boolean;
}

export const BLOCKED_USER_INFO: Partial<UserInfo> = {
  Wins: 0,
  Losses: 0,
  img: 'https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif',
  isOnline: false,
  isPlaying: false,
};
