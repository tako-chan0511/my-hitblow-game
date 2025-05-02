import { defineStore } from 'pinia';

// 履歴エントリの型定義
export interface HistoryEntry {
  guess: string;
  hit: number;
  blow: number;
}

// ストアの状態型定義
export interface GameState {
  secret: string;
  history: HistoryEntry[];
  message: string;
}

/**
 * 4桁の重複なしランダム文字列を生成
 */
function generateSecret(): string {
  const numbers: string[] = Array.from({ length: 10 }, (_, i) => i.toString());
  return Array.from({ length: 4 }, (): string => {
    return numbers.splice(
      Math.floor(Math.random() * numbers.length),
      1
    )[0];
  }).join('');
}

// 局所的に全候補リストを作る（4桁重複なし=10P4=5040通り）
function allCandidates(): string[] {
  const nums = Array.from({ length: 10 }, (_, i) => i.toString());
  const result: string[] = [];
  function build(prefix: string, arr: string[]) {
    if (prefix.length === 4) return result.push(prefix);
    for (let i = 0; i < arr.length; i++) {
      build(prefix + arr[i], arr.filter((_, j) => j !== i));
    }
  }
  build('', nums);
  return result;
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    secret: generateSecret(),
    history: [],
    message: '',
  }),
  getters: {
    // これまでの実装そのまま
    remainingCandidates(state): string[] {
      return allCandidates().filter(candidate => {
        return state.history.every(({ guess, hit, blow }) => {
          let h = 0, b = 0;
          for (let i = 0; i < 4; i++) {
            if (candidate[i] === guess[i]) h++;
            else if (guess.includes(candidate[i])) b++;
          }
          return h === hit && b === blow;
        });
      });
    },

    /**
     * @param state
     * @returns 指定の履歴 index までを適用した時点の候補一覧を返す関数
     */
    remainingCandidatesAt: (state): ((index: number) => string[]) => {
      return (index: number) => {
        // 全候補から、history[0]～history[index] までを順にフィルタ
        return allCandidates().filter(candidate => {
          return state.history
            .slice(0, index + 1)
            .every(({ guess, hit, blow }) => {
              let h = 0, b = 0;
              for (let i = 0; i < 4; i++) {
                if (candidate[i] === guess[i]) h++;
                else if (guess.includes(candidate[i])) b++;
              }
              return h === hit && b === blow;
            });
        });
      };
    }
  },
  actions: {
    reset(): void {
      this.secret = generateSecret();
      this.history = [];
      this.message = '';
    },

    checkGuess(guess: string): void {
      if (!/^\d{4}$/.test(guess) || new Set(guess).size !== 4) {
        this.message = '4桁の異なる数字を入力してください。';
        return;
      }

      let hit = 0;
      let blow = 0;
      for (let i = 0; i < 4; i++) {
        if (guess[i] === this.secret[i]) {
          hit++;
        } else if (this.secret.includes(guess[i])) {
          blow++;
        }
      }

      this.history.push({ guess, hit, blow });
      this.message =
        hit === 4
          ? `正解！秘密の数字は ${this.secret} でした。`
          : `${hit} Hit, ${blow} Blow`;
    },

    /**
     * 任意の履歴位置（index）からやり直す
     * ／この行を含めずに履歴を切り戻す
     * @param index - やり直したい履歴のインデックス
     */
    rollbackTo(index: number): void {
      this.history = this.history.slice(0, index);
      this.message = index > 0
        ? `第${index}回目からやり直しました。`
        : '最初からやり直しました。';
    },
  },
});
