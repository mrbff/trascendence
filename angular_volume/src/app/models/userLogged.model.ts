export interface UserLoggedModel {
  Wins: string;
  Losses: string;
  Played: string;
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
}
