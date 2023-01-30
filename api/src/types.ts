export type OnlineJudge = {
  key: string;
  siteName: string;
  counter?: (userName: string) => Promise<number | null> | (number | null);
};
