import { Injectable } from '@nestjs/common';
import {
  countAoj,
  countAtcoder,
  countCodechef,
  countCodeforces,
  countLeetcode,
  countTopcoder,
  countYukicoder,
} from 'src/ac-counters';
import { OnlineJudge } from 'src/types';
import { AcCountInput } from './ac-count.dto';

const onlineJudges: OnlineJudge[] = [
  {
    key: 'atcoder',
    siteName: 'AtCoder',
    counter: countAtcoder,
  },
  {
    key: 'codeforces',
    siteName: 'Codeforces',
    counter: countCodeforces,
  },
  {
    key: 'aoj',
    siteName: 'AOJ',
    counter: countAoj,
  },
  {
    key: 'yukicoder',
    siteName: 'yukicoder',
    counter: countYukicoder,
  },
  {
    key: 'librarychecker',
    siteName: 'Library Checker',
  },
  {
    key: 'codechef',
    siteName: 'CodeChef',
    counter: countCodechef,
  },
  {
    key: 'leetcode',
    siteName: 'LeetCode',
    counter: countLeetcode,
  },
  {
    key: 'topcoder',
    siteName: 'TopCoder',
    counter: countTopcoder,
  },
];

@Injectable()
export class AcCountService {

  async getAcCount(inputs: AcCountInput): Promise<(number | null)[]> {
    // 並列処理
    const data: (number | null)[] = await Promise.all(onlineJudges.map(
      async (oj: OnlineJudge): Promise<(number | null)> => {
        const input = inputs[oj.key as keyof AcCountInput];
        if (input && oj.counter) {
          return await oj.counter(input);
        } else {
          return null;
        }
    }));

    return data;
  }
}
