import axios from 'axios';
import { Element, load } from 'cheerio';

export const countAtcoder = async (userName: string): Promise<number | null> => {
  try {
    const { data } = await axios.get(
      `https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${userName}`
    );
    if (data.count) {
      return data.count;
    }
    return null;
  } catch (err) {
    const { message } = err as Error;
    console.log(message);
    return null;
  }
};

// ※CFスクレイピングできなくなってたので、前のに戻した
// プロフィールページからのスクレイピングにした
// export const countCodeforces = async (userName: string): Promise<number | null> => {
//   try {
//     const { data } = await axios.get(`https://codeforces.com/profile/${userName}`);
//     const $ = load(data);
//     const el: Element | undefined = $('div._UserActivityFrame_counterDescription')
//       .toArray()
//       .find((el) => $(el).text().trim() === 'solved for all time');
//     if (el) {
//       const txt = $(el).prev().text().trim();
//       // '1788 problems'
//       const i = txt.indexOf(' ');
//       if (i !== -1) {
//         const count = Number(txt.substring(0, i));
//         if (!isNaN(count)) {
//           return count;
//         }
//       }
//     }
//     return null;
//   } catch (err) {
//     const { message } = err as Error;
//     console.log(message);
//     return null;
//   }
// };

// beetさんのやつをほぼそのまま流用
export const countCodeforces = async (
  userName: string,
): Promise<number | null> => {
  // ref: https://github.com/beet-aizu/rating-history/blob/master/request.js
  try {
    const { data } = await axios.get(
      `https://codeforces.com/api/user.status?handle=${userName}`,
    );
    if (data.result) {
      const submissions = data.result;
      // problems[contestId][problemName] の2次元連想配列
      // const problems: {[key: string]: {[key: string]: number}} = {};
      // 連想配列の値にSet<string>
      const problems: { [key: string]: Set<string> } = {};
      let res = 0;
      submissions.forEach((submission: any) => {
        const { verdict, testset, problem } = submission;
        if (verdict !== 'OK' || testset !== 'TESTS') {
          return;
        }
        if (problems[problem.contestId] !== undefined) {
          if (!problems[problem.contestId].has(problem.name)) {
            problems[problem.contestId].add(problem.name);
            res++;
          }
        } else {
          problems[problem.contestId] = new Set<string>();
          problems[problem.contestId].add(problem.name);
          res++;
        }
      });
      return res;
    }
    return null;
  } catch (err) {
    const { message } = err as Error;
    console.log(message);
    return null;
  }
};

export const countAoj = async (userName: string): Promise<number | null> => {
  try {
    const { data } = await axios.get(`https://judgeapi.u-aizu.ac.jp/users/${userName}`);
    if (data.status?.solved) {
      return data.status.solved;
    }
    return null;
  } catch (err) {
    const { message } = err as Error;
    console.log(message);
    return null;
  }
};

export const countYukicoder = async (userName: string): Promise<number | null> => {
  try {
    const { data } = await axios.get(`https://yukicoder.me/api/v1/user/name/${userName}`);
    if (data.Solved) {
      return data.Solved;
    }
    return null;
  } catch (err) {
    const { message } = err as Error;
    console.log(message);
    return null;
  }
};

// 有志のAPIで良い感じのがあったのでそれを使う
export const countLeetcode = async (userName: string): Promise<number | null> => {
  try {
    // see: https://github.com/JeremyTsaii/leetcode-stats-apihttps://github.com/JeremyTsaii/leetcode-stats-api
    const { data } = await axios.get(`https://leetcode-stats-api.herokuapp.com/${userName}`);
    if (data.totalSolved) {
      return data.totalSolved;
    }
    return null;
    // 公式APIっぽいGraphQL(なんか見れなくなった)
    // see: https://leetcode.com/discuss/general-discussion/1297705/is-there-public-api-endpoints-available-for-leetcode
    // const { data } = await axios.post(`https://leetcode.com/graphql`, {
    //   query: `
    //       { matchedUser(username: "${userName}") {
    //         username
    //           submitStats: submitStatsGlobal {
    //             acSubmissionNum {
    //               difficulty
    //               count
    //               submissions
    //             }
    //           }
    //         }
    //       }
    //     `,
    // });
    // if (data.data?.matchedUser?.submitStats?.acSubmissionNum) {
    //   for (const obj of data.data.matchedUser.submitStats.acSubmissionNum) {
    //     if (obj.difficulty === 'All' && obj.count) {
    //       return obj.count;
    //     }
    //   }
    // }
    // return null;
  } catch (err) {
    const { message } = err as Error;
    console.log(message);
    return null;
  }
};

// 公式APIが一般公開を止めているらしく、ユーザーのプロフィールページからスクレイピングした。
export const countCodechef = async (userName: string): Promise<number | null> => {
  try {
    // ref: https://qiita.com/Syoitu/items/6a136e3b8d2fb65e51a2
    //      https://www.twilio.com/blog/4-tools-for-web-scraping-in-node-js-jp
    const { data } = await axios.get(`https://www.codechef.com/users/${userName}`);
    const $ = load(data);
    const txt: string | undefined = $('script[type="text/javascript"]')
      .map((i, el) => $(el).text().trim())
      .toArray()
      .find((txt) => txt.startsWith('jQuery(document)'));
    if (txt) {
      const solutionsAccepted = 'solutions_accepted';
      const i = txt.indexOf(solutionsAccepted);
      if (i !== -1) {
        // 2回目の'solutions_accepted'
        const j = txt.indexOf(solutionsAccepted, i + 1);
        if (j !== -1) {
          // 'solutions_accepted',y:44,color...
          const l = j + solutionsAccepted.length + 4;
          const r = txt.indexOf(',', l);
          if (r !== -1) {
            const count = Number(txt.substring(l, r));
            if (!isNaN(count)) {
              return count;
            }
          }
        }
      }
    }
    return null;
  } catch (err) {
    const { message } = err as Error;
    console.log(message);
    return null;
  }
};

// v2が使えなくなり、v5のAPIから取得できるようにした。
export const countTopcoder = async (userName: string): Promise<number | null> => {
  try {
    const { data } = await axios.get(`https://api.topcoder.com/v5/members?handle=${userName}`);
    let count = 0;
    if (data[0].stats[0].DATA_SCIENCE.SRM.division1) {
      count += data[0].stats[0].DATA_SCIENCE.SRM.division1.reduce((acc: number, cur: any) => {
        return acc + cur.problemsSubmitted - cur.problemsSysByTest - cur.problemsFailed;
      }, 0);
    }
    if (data[0].stats[0].DATA_SCIENCE.SRM.division2) {
      count += data[0].stats[0].DATA_SCIENCE.SRM.division2.reduce((acc: number, cur: any) => {
        return acc + cur.problemsSubmitted - cur.problemsSysByTest - cur.problemsFailed;
      }, 0);
    }
    return count;
  } catch (err) {
    const { message } = err as Error;
    console.log(message);
    return null;
  }
};
