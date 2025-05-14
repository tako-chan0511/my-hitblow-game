// src/workers/candidate.worker.ts
/// <reference lib="webworker" />
import { allCandidatesFast, filterByHistory } from '../lib/candidate';

interface Request {
  digitCount: number;
  history: { guess: string; hit: number; blow: number }[];
}

addEventListener('message', (e) => {
  const { digitCount, history } = e.data as Request;
  // 全候補を生成
  const all = allCandidatesFast(digitCount);
  // history で絞り込む
  const filtered = history.length > 0
    ? filterByHistory(all, history)
    : all;
  // 結果をメインスレッドへ返却
  postMessage(filtered);
});
