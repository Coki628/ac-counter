import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import './App.css';
import {
  countAoj,
  countAtcoder,
  countCodechef,
  countCodeforces,
  countLeetcode,
  countLibrarychecker,
  countTopcoder,
  countYukicoder,
} from './logic';

type Inputs = {
  atcoder: string;
  codeforces: string;
  aoj: string;
  yukicoder: string;
  librarychecker: string;
  leetcode: string;
  codechef: string;
  topcoder: string;
};

type TableRow = {
  siteName: string;
  acCount: number | null;
};

type OnlineJudge = {
  key: string;
  siteName: string;
  counter: (userName: string) => Promise<number | null>;
}

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
    counter: countLibrarychecker,
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

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const [tableRows, setTableRows] = useState<TableRow[]>();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [tweetText, setTweetText] = useState<string>('');
  const [tweetTextWithUrl, setTweetTextWithUrl] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  // tableRowsの更新を確認してからスクロールさせる
  useEffect(() => {
    document.getElementById('result-table')?.scrollIntoView();
  }, [tableRows]);
  useEffect(() => {
    /* eslint-disable no-restricted-globals */
    setTweetTextWithUrl(`${tweetText}${location.origin}${location.pathname}?${searchParams.toString()}`);
  }, [tweetText, searchParams]);

  const onSubmit: SubmitHandler<Inputs> = async (
    inputs: Inputs,
    event?: React.BaseSyntheticEvent,
  ): Promise<void> => {
    let totalCount: number = 0;
    let userName = '';
    let searchParams: { [key: string]: string } = {};

    // 並列処理
    const data: TableRow[] = await Promise.all(onlineJudges.map(
      async (oj: OnlineJudge): Promise<TableRow> => {
        const input = inputs[oj.key as keyof Inputs];
        if (input) {
          searchParams[oj.key] = input;
          if (!userName) {
            userName = input;
          }
          const count = await oj.counter(input);
          if (count) {
            totalCount += count;
          }
          return {siteName: oj.siteName, acCount: count};
        } else {
          return {siteName: '', acCount: null };
        }
    }));

    let tweetText = '';
    if (userName) {
      tweetText += `Solved By ${userName}\n`;
    }
    data.forEach((tr: TableRow) => {
      if (tr.acCount) {
        tweetText += `${tr.siteName}: ${tr.acCount}\n`;
      }
    });
    tweetText += `Total: ${totalCount}\n`;
  
    setTweetText(tweetText);
    setSearchParams(searchParams);
    setTableRows(data);
    setTotalCount(totalCount);
    event?.preventDefault();
  };

  return (
    <div className="App">
      <h1>AC Counter</h1>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {onlineJudges
            .filter((oj) => (oj.key !== 'codechef' && oj.key !== 'leetcode') || process.env.NODE_ENV === 'development')
            .map((oj: OnlineJudge) => (
              <div key={oj.key}>
                <label htmlFor={oj.key}>{oj.siteName}</label>
                <input
                  {...register(oj.key as keyof Inputs)}
                  id={oj.key}
                  placeholder={`${oj.siteName} ID`}
                  defaultValue={searchParams.get(oj.key) ?? undefined}
                />
                {oj.key === 'topcoder' && (
                  <div>
                    *TopCoder's problems are considered only if you solve them in the contests.<br />
                    (Submissions in practice rooms are ignored due to API specification)
                  </div>
                )}
              </div>
            )
          )}
          <button className="primary-btn" type="submit" disabled={isSubmitting}>Count!</button>
        </form>
      </div>
      {isSubmitting && (
        <div className="loading-layout">loading... <img src={`${process.env.PUBLIC_URL}/spinner.gif`} alt="spinner" /></div>
      )}
      {!isSubmitting && tableRows && (
        <div className="result-wrapper">
          <table id="result-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {tableRows
                .filter((tr: TableRow) => tr.siteName !== '')
                .map((tr: TableRow) =>
                  <tr key={tr.siteName}>
                    <td>{tr.siteName}</td>
                    <td>{tr.acCount ?? '-'}</td>
                  </tr>
              )}
              <tr className="total-row">
                <td>Total</td>
                <td>{totalCount}</td>
              </tr>
            </tbody>
          </table>
          {tweetText && (
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetTextWithUrl)}`} target="_blank" rel="noreferrer">
              <button className="primary-btn" type="button">Tweet!</button>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
