type UserStatistics = {
  array: [string, number]; // userName, acCount
};

// beetさんのやつをほぼそのまま流用
export const countLibrarychecker = (userName: string): number | null => {
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
