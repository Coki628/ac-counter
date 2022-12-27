export type AcCountInput = {
  atcoder?: string;
  codeforces?: string;
  aoj?: string;
  yukicoder?: string;
  librarychecker?: string;
  leetcode?: string;
  codechef?: string;
  topcoder?: string;
};

export type AcCountResult = {
  siteName: string;
  acCount: number | null;
};

export type OnlineJudge = {
  key: string;
  siteName: string;
  counter?: (userName: string) => Promise<number | null> | (number | null);
}
