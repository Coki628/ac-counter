import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import './App.css';
import { countLibrarychecker } from './ac-counters';
import { AcCountInput, AcCountResult, OnlineJudge } from './types';

const onlineJudges: OnlineJudge[] = [
  {
    key: 'atcoder',
    siteName: 'AtCoder',
  },
  {
    key: 'codeforces',
    siteName: 'Codeforces',
  },
  {
    key: 'aoj',
    siteName: 'AOJ',
  },
  {
    key: 'yukicoder',
    siteName: 'yukicoder',
  },
  {
    key: 'librarychecker',
    siteName: 'Library Checker',
    counter: countLibrarychecker,
  },
  {
    key: 'codechef',
    siteName: 'CodeChef',
  },
  {
    key: 'leetcode',
    siteName: 'LeetCode',
  },
  // ※v2のAPIが消えてしまったっぽいので、利用停止
  // {
  //   key: 'topcoder',
  //   siteName: 'TopCoder',
  // },
];

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcCountInput>();
  const [acCountResults, setAcCountResults] = useState<AcCountResult[]>();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [tweetText, setTweetText] = useState<string>('');
  const [tweetTextWithUrl, setTweetTextWithUrl] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  // acCountResultsの更新を確認してからスクロールさせる
  useEffect(() => {
    document.getElementById('result-table')?.scrollIntoView();
  }, [acCountResults]);
  useEffect(() => {
    /* eslint-disable no-restricted-globals */
    setTweetTextWithUrl(`${tweetText}${location.origin}${location.pathname}?${searchParams.toString()}`);
  }, [tweetText, searchParams]);
  useEffect(() => {
    document.title = userName ?  `AC Counter - ${userName}` : "AC Counter";
  }, [userName]);

  const onSubmit: SubmitHandler<AcCountInput> = async (
    inputs: AcCountInput,
    event?: React.BaseSyntheticEvent,
  ): Promise<void> => {
    let totalCount: number = 0;
    let userName: string = '';
    let searchParams: { [key: string]: string } = {};
    let tweetText: string = '';

    const response = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/ac-count`, inputs);

    const data: AcCountResult[] = [];
    if (response.data.length === onlineJudges.length) {
      for (let i = 0; i < onlineJudges.length; i++) {
        const { key, siteName, counter } = onlineJudges[i];
        let acCount = response.data[i];
        const input = inputs[key as keyof AcCountInput];
        if (input) {
          searchParams[key] = input;
          if (counter) {
            acCount = counter(input);
          }
          if (!userName) {
            userName = input;
          };
          if (acCount) {
            totalCount += acCount;
          }
          data.push({siteName, acCount});
        }
      }
    }

    if (userName) {
      tweetText += `Solved By ${userName}\n`;
    }
    data.forEach((tr: AcCountResult) => {
      if (tr.acCount) {
        tweetText += `${tr.siteName}: ${tr.acCount}\n`;
      }
    });
    if (tweetText) {
      tweetText += `Total: ${totalCount}\n`;
    }

    setTweetText(tweetText);
    setSearchParams(searchParams);
    setAcCountResults(data);
    setTotalCount(totalCount);
    setUserName(userName);
    event?.preventDefault();
  };

  return (
    <div className="App">
      <h1>AC Counter</h1>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {onlineJudges
            .map((oj: OnlineJudge) => (
              <div key={oj.key}>
                <label htmlFor={oj.key}>{oj.siteName}</label>
                <input
                  {...register(oj.key as keyof AcCountInput)}
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
      {!isSubmitting && acCountResults && (
        <div className="result-wrapper">
          <table id="result-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {acCountResults
                .map((res: AcCountResult) =>
                  <tr key={res.siteName}>
                    <td>{res.siteName}</td>
                    <td>{res.acCount ?? '-'}</td>
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
