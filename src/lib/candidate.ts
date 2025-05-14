// src/lib/candidate.ts
/** ビットマスク＋キャッシュ方式で全候補を生成 */
const candidateCache: Record<number, string[]> = {};
export function allCandidatesFast(digitCount: number): string[] {
  if (candidateCache[digitCount]) return candidateCache[digitCount];
  const result: string[] = [];
  function dfs(prefix: string, usedMask: number) {
    if (prefix.length === digitCount) {
      result.push(prefix);
      return;
    }
    for (let d = 0; d < 10; d++) {
      if (!(usedMask & (1 << d))) {
        dfs(prefix + d, usedMask | (1 << d));
      }
    }
  }
  dfs('', 0);
  candidateCache[digitCount] = result;
  return result;
}

/**
 * Hit/Blowでhistoryに一致する候補だけ残す
 */
export function filterByHistory(
  candidates: string[],
  history: { guess: string; hit: number; blow: number }[]
): string[] {
  const n = history[0]?.guess.length ?? 0;
  return candidates.filter((cand) => {
    return history.every(({ guess, hit, blow }) => {
      let h = 0, b = 0;
      for (let i = 0; i < n; i++) {
        if (cand[i] === guess[i]) h++;
        else if (guess.includes(cand[i])) b++;
      }
      return h === hit && b === blow;
    });
  });
}
