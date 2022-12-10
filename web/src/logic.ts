import axios from "axios";
import { load } from "cheerio";

// 最新ぽいv3版はCORSがあって、v2(Deprecatedらしいけど…)だとフロントからそのまま取れた。
export const countAtcoder = async (userName: string): Promise<number | null> => {
  try {
    // const { data }= await axios.get(`${process.env.REACT_APP_KENKOOOO_URL}/atcoder/atcoder-api/v3/user/ac_rank?user=${userName}`);
    // if (data.count) {
    //   return data.count;
    // }
    // return null;

    const { data } = await axios.get(`https://kenkoooo.com/atcoder/atcoder-api/v2/user_info?user=${userName}`);
    if (data.accepted_count) {
      return data.accepted_count;
    }
    return null;
  } catch (err) {
    const { message } = err as Error;
    console.log(message);
    return null;
  }
};

// beetさんのやつをほぼそのまま流用
export const countCodeforces = async (userName: string): Promise<number | null> => {
  // ref: https://github.com/beet-aizu/rating-history/blob/master/request.js
  try {
    const { data } = await axios.get(`https://codeforces.com/api/user.status?handle=${userName}`);
    if (data.result) {
      const submissions = data.result;
      // problems[contestId][problemName] の2次元連想配列
      // const problems: {[key: string]: {[key: string]: number}} = {};
      // 連想配列の値にSet<string>
      const problems: {[key: string]: Set<string>} = {};
      let res = 0;
      submissions.forEach((submission: any) => {
        const { verdict, testset, problem } = submission;
        if (verdict !== "OK" || testset !== "TESTS") {
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

type UserStatistics = {
  array: [string, number]; // userName, acCount
};

// beetさんのやつをほぼそのまま流用
export const countLibrarychecker = async (userName: string): Promise<number | null> => {
  try {
    // ※通常はページ表示から1秒もかからないくらいでmain.jsからここに結果が読み込まれる
    // グローバル変数への参照
    // 参考：https://morioh.com/p/225208537453
    // 　　　https://blog.tanebox.com/archives/1757/
    const libraryCheckerResult: UserStatistics[] = (window as any).libraryCheckerResult;
    if (libraryCheckerResult) {
      for (const statistics of libraryCheckerResult) {
        if (statistics.array.length < 2) {
          continue;
        }
        if (statistics.array[0] === userName) {
          return statistics.array[1];
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

// 公式らしきGraphQLはCORSがあって、有志のやつならフロントからも取れた。
export const countLeetcode = async (userName: string): Promise<number | null> => {
  try {
    // ref: https://leetcode.com/discuss/general-discussion/1297705/is-there-public-api-endpoints-available-for-leetcode
    const { data } = await axios.post(
      `${process.env.REACT_APP_LEETCODE_URL}/graphql`,
      {
        query: `
          { matchedUser(username: "${userName}") {
            username
              submitStats: submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                  submissions
                }
              }
            }
          }
        `
      }
    );
    if (data.data?.matchedUser?.submitStats?.acSubmissionNum) {
      for (const obj of data.data.matchedUser.submitStats.acSubmissionNum) {
        if (obj.difficulty === 'All' && obj.count) {
          return obj.count;
        }
      }
    }
    return null;

    // ref: https://github.com/JeremyTsaii/leetcode-stats-api
    // herokuだったのでもう使えなくなったっぽい…。
    // const { data } = await axios.get(`https://leetcode-stats-api.herokuapp.com/${userName}`);
    // if (data.totalSolved) {
    //   return data.totalSolved;
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
    // これもCORS(まあWebページ本体だからそれはそうか…)
    const { data } = await axios.get(`${process.env.REACT_APP_CODECHEF_URL}/users/${userName}`);
    const $ = load(data);
    const txt: string | undefined = $('.problems-solved h5')
      .map((i, el) => $(el).text())
      .toArray()
      .find((txt) => txt.startsWith('Fully Solved'))
      ?.trim();
    if (txt) {
      const l: number = txt.indexOf('(');
      const r: number = txt.lastIndexOf(')');
      if (l !== -1 && r !== -1 && l < r) {
        const count = Number(txt.substring(l+1, r));
        if (!isNaN(count)) {
          return count;
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

// beetさんのやつをほぼそのまま流用
export const countTopcoder = async (userName: string): Promise<number | null> => {
  // ref: https://github.com/beet-aizu/rating-history/blob/master/request.js
  try {
    const { data } = await axios.get(`https://api.topcoder.com/v2/users/${userName}/statistics/data/srm`);
    let count = 0;
    const div1 = data['Divisions']['Division I' ]['Level Total'];
    const div2 = data['Divisions']['Division II']['Level Total'];
    count += div1['submitted'];
    count -= div1['failedChallenge'];
    count -= div1['failedSys.Test'];
    count += div2['submitted'];
    count -= div2['failedChallenge'];
    count -= div2['failedSys.Test'];
    return count;
  } catch (err) {
    const { message } = err as Error;
    console.log(message);
    return null;
  }
};
