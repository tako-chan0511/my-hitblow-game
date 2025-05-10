import { defineStore } from 'pinia';
import { postCompletedHistory } from '@/api';

// 履歴エントリの型定義
export interface HistoryEntry {
  guess: string;
  hit: number;
  blow: number;
}

// ストアの状態型定義
export interface GameState {
  // 秘密の数字
  secret: string;
  // 過去の推測履歴
  history: HistoryEntry[];
  // 結果メッセージ
  message: string;
  // 現在の桁数（1〜10）
  digitCount: number;

  // 以下、パフォーマンス改善用に追加
  // 絞り込み後の候補リスト
  candidates: string[];
  // 各履歴インデックスごとの候補リストスナップショット
  candidatesHistory: string[][];
}

/**
 * 指定された桁数の重複なしランダム文字列を生成
 */
function generateSecret(digitCount: number): string {
  const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
  return Array.from({ length: digitCount }, () => {
    const idx = Math.floor(Math.random() * numbers.length);
    return numbers.splice(idx, 1)[0];
  }).join('');
}

// -------------------------------------------------
// ビットマスク＋キャッシュ方式の全候補生成
// -------------------------------------------------
const candidateCache: Record<number, string[]> = {};
function allCandidatesFast(digitCount: number): string[] {
  if (candidateCache[digitCount]) {
    return candidateCache[digitCount];
  }
  const result: string[] = [];
  function dfs(prefix: string, usedMask: number): void {
    if (prefix.length === digitCount) {
      result.push(prefix);
      return;
    }
    for (let d = 0; d < 10; d++) {
      if (!(usedMask & (1 << d))) {
        dfs(prefix + d.toString(), usedMask | (1 << d));
      }
    }
  }
  dfs('', 0);
  candidateCache[digitCount] = result;
  return result;
}

export const useGameStore = defineStore('game', {
  state: (): GameState => {
    const initialDigit = 4; // 10桁指定可能
    const initialCands = allCandidatesFast(initialDigit);
    return {
      digitCount: initialDigit,
      secret: generateSecret(initialDigit),
      history: [],
      message: '',
      candidates: initialCands,
      candidatesHistory: [initialCands],
    };
  },

  getters: {
    // 絞り込み済み候補をそのまま返す
    remainingCandidates(state): string[] {
      return state.candidates;
    },

    // 任意の履歴インデックス後の候補リストを返す
    remainingCandidatesAt: (state): ((index: number) => string[]) => {
      return (index: number) => {
        // index=0 の場合は最初のチェック後なのでスナップショットは candidatesHistory[1]
        return state.candidatesHistory[index + 1] || [];
      };
    },
  },

  actions: {
    /**
     * 桁数を設定し、ゲームをリセット
     */
    setDigitCount(count: number): void {
      this.digitCount = Math.max(1, Math.min(10, count));
      this.reset();
    },

    /**
     * ゲームをリセット
     */
    reset(): void {
      this.secret = generateSecret(this.digitCount);
      this.history = [];
      this.message = '';
      // 候補リストも再生成＆履歴クリア
      const cands = allCandidatesFast(this.digitCount);
      this.candidates = cands;
      this.candidatesHistory = [cands];
    },

    /**
     * ユーザの推測を判定し、候補をインクリメンタルに絞り込む
     */
    async checkGuess(guess: string): Promise<void> {
      // バリデーション: 桁数・重複チェック
      const pattern = new RegExp(`^\\d{${this.digitCount}}$`);
      if (!pattern.test(guess) || new Set(guess).size !== this.digitCount) {
        this.message = `${this.digitCount}桁の異なる数字を入力してください。`;
        return;
      }

      // Hit/Blow 計算
      let hit = 0;
      let blow = 0;
      for (let i = 0; i < this.digitCount; i++) {
        if (guess[i] === this.secret[i]) hit++;
        else if (this.secret.includes(guess[i])) blow++;
      }

      // 履歴に追加
      this.history.push({ guess, hit, blow });

      // 正解なら DB に完了履歴を保存
      if (hit === this.digitCount) {
        try {
          await postCompletedHistory(this.digitCount, this.history.length);
          console.log('完了履歴を登録しました');
        } catch (e) {
          console.error('完了履歴登録に失敗しました', e);
        }
      }

      // インクリメンタル絞り込み
      this.candidates = this.candidates.filter(candidate => {
        let h = 0, b = 0;
        for (let i = 0; i < this.digitCount; i++) {
          if (candidate[i] === guess[i]) h++;
          else if (guess.includes(candidate[i])) b++;
        }
        return h === hit && b === blow;
      });
      // スナップショット保存
      this.candidatesHistory.push(this.candidates);

      // メッセージ更新
      if (hit === this.digitCount) {
        this.message = `おめでとう！${this.history.length} 回で正解！`;  
      } else {
        this.message = `${hit} Hit, ${blow} Blow`;
      }
    },

    /**
     * 指定履歴インデックスまでロールバック
     */
    rollbackTo(index: number): void {
      // 履歴と候補を巻き戻す
      this.history = this.history.slice(0, index);
      this.candidates = this.candidatesHistory[index];
      this.candidatesHistory = this.candidatesHistory.slice(0, index + 1);

      this.message =
        index > 0
          ? `${index+1}回目からやり直します。`
          : '最初からやり直しました。';
    },
  },
});
