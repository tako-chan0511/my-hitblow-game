import { defineStore } from 'pinia';

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

/**
 * 指定された桁数の全候補を生成 (Permutation)
 */
function allCandidates(digitCount: number): string[] {
  const nums = Array.from({ length: 10 }, (_, i) => i.toString());
  const result: string[] = [];
  function build(prefix: string, arr: string[]) {
    if (prefix.length === digitCount) {
      result.push(prefix);
    } else {
      for (let i = 0; i < arr.length; i++) {
        build(prefix + arr[i], arr.filter((_, j) => j !== i));
      }
    }
  }
  build('', nums);
  return result;
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    secret: generateSecret(4),   // 初期桁数は4
    history: [],
    message: '',
    digitCount: 4,
  }),

  getters: {
    /**
     * 現在の履歴に基づいた候補一覧を取得
     */
    remainingCandidates(state): string[] {
      return allCandidates(state.digitCount).filter(candidate =>
        state.history.every(({ guess, hit, blow }) => {
          let h = 0, b = 0;
          for (let i = 0; i < state.digitCount; i++) {
            if (candidate[i] === guess[i]) h++;
            else if (guess.includes(candidate[i])) b++;
          }
          return h === hit && b === blow;
        })
      );
    },

    /**
     * 指定インデックスまでの履歴での候補を取得する関数
     */
    remainingCandidatesAt: (state): ((index: number) => string[]) => {
      return (index: number) =>
        allCandidates(state.digitCount).filter(candidate =>
          state.history.slice(0, index + 1).every(({ guess, hit, blow }) => {
            let h = 0, b = 0;
            for (let i = 0; i < state.digitCount; i++) {
              if (candidate[i] === guess[i]) h++;
              else if (guess.includes(candidate[i])) b++;
            }
            return h === hit && b === blow;
          })
        );
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
    },

    /**
     * ユーザの推測を判定
     */
    checkGuess(guess: string): void {
      // バリデーション: 桁数・重複チェック
      const pattern = new RegExp(`^\\d{${this.digitCount}}$`);
      if (!pattern.test(guess) || new Set(guess).size !== this.digitCount) {
        this.message = `${this.digitCount}桁の異なる数字を入力してください。`;
        return;
      }

      let hit = 0;
      let blow = 0;
      for (let i = 0; i < this.digitCount; i++) {
        if (guess[i] === this.secret[i]) hit++;
        else if (this.secret.includes(guess[i])) blow++;
      }

      this.history.push({ guess, hit, blow });
      // 1桁モードの場合の専用メッセージ
      if (this.digitCount === 1) {
        this.message =
          hit === 1
            ? `正解！秘密の数字は ${this.secret} でした。`
            : '不正解です。';
      } else {
        this.message =
          hit === this.digitCount
            ? `正解！秘密の数字は ${this.secret} でした。`
            : `${hit} Hit, ${blow} Blow`;
      }
    },

    /**
     * 指定履歴インデックスまでロールバック
     */
    rollbackTo(index: number): void {
      this.history = this.history.slice(0, index);
      this.message =
        index > 0
          ? `第${index}回目からやり直しました。`
          : '最初からやり直しました。';
    },
  },
});
