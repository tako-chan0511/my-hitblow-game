// src/stores/game.ts
import { addResult } from '@/lib/db';
import { defineStore } from 'pinia';
import { allCandidatesFast, filterByHistory } from '@/lib/candidate';
// Web Worker をバンドルする場合の Vite 用クエリ
import CandidateWorker from '@/workers/candidate.worker.ts?worker';

// 履歴エントリの型定義
export interface HistoryEntry {
  guess: string;
  hit: number;
  blow: number;
}

// 対戦履歴エントリの型定義
export interface VsHistoryEntry {
  digitCount: number;            // 何桁ゲームだったか
  result: 'win' | 'lose' | 'draw'; // 勝敗
  userAttempts: number;          // 手数（共通）
  compAttempts: number;          // コンピュータの手数
  userSecret: string;            // あなたの秘密
  compSecret: string;            // コンピュータの秘密
  playedAt: string;              // プレイ日時（ISO文字列）
}

// ストアの状態型定義
export interface GameState {
  digitCount: number;
  secret: string;
  history: HistoryEntry[];
  message: string;
  startTime: number;
  candidates: string[];
  candidatesHistory: string[][];
  currentDigits: string[];
  // 追加：対戦履歴
  vsHistory: VsHistoryEntry[];
}

// 重複なしランダム文字列を生成
function generateSecret(digitCount: number): string {
  const nums = Array.from({ length: 10 }, (_, i) => i.toString());
  return Array.from({ length: digitCount }, () => {
    const idx = Math.floor(Math.random() * nums.length);
    return nums.splice(idx, 1)[0];
  }).join('');
}

export const useGameStore = defineStore('game', {
  state: (): GameState => {
    const initialDigit = 4;  // デフォルト4桁
    const cands = allCandidatesFast(initialDigit);
    return {
      digitCount: initialDigit,
      secret: generateSecret(initialDigit),
      history: [],
      message: '',
      startTime: Date.now(),
      candidates: cands,
      candidatesHistory: [cands],
      currentDigits: Array.from({ length: initialDigit }, () => ''),
      vsHistory: []  // ここに対戦履歴を蓄積
    };
  },

  getters: {
    remainingCandidates: (s) => s.candidates,
    remainingCandidatesAt: (s) => (idx: number) => s.candidatesHistory[idx + 1] || [],
    // 追加：新しい順に取得
    getVsHistory: (s) => s.vsHistory
  },

  actions: {
    setDigitCount(count: number) {
      this.digitCount = Math.max(1, Math.min(10, count));
      this.reset();
      this.currentDigits = Array.from({ length: this.digitCount }, () => '');
    },

    // 追加：現在のスロット入力を更新
    setCurrentDigits(digits: string[]) {
      this.currentDigits = digits;
    },

    reset() {
      this.secret = generateSecret(this.digitCount);
      this.history = [];
      this.message = '';
      this.startTime = Date.now();
      const all = allCandidatesFast(this.digitCount);
      this.candidates = all;
      this.candidatesHistory = [all];
      this.currentDigits = Array.from({ length: this.digitCount }, () => '');
    },

    async checkGuess(guess: string) {
      // バリデーション
      const pat = new RegExp(`^\\d{${this.digitCount}}$`);
      if (!pat.test(guess) || new Set(guess).size !== this.digitCount) {
        this.message = `${this.digitCount}桁の異なる数字を入力してください。`;
        return;
      }

      // Hit/Blow
      let hit = 0, blow = 0;
      for (let i = 0; i < this.digitCount; i++) {
        if (guess[i] === this.secret[i]) hit++;
        else if (this.secret.includes(guess[i])) blow++;
      }
      this.history.push({ guess, hit, blow });

      // 候補更新
      await this.updateCandidates();

      this.message = hit === this.digitCount
        ? `正解！秘密の数字は ${this.secret} でした。`
        : `${hit} Hit, ${blow} Blow`;

      if (hit === this.digitCount) {
        const attempts = this.history.length;
        const elapsed = Date.now() - this.startTime;
        const playedAtJp = new Date().toLocaleString('ja-JP', {
          timeZone: 'Asia/Tokyo', hour12: false
        });
        await addResult(this.digitCount, attempts, elapsed, playedAtJp);
      }

      // 送信後はスロットをクリア
      this.currentDigits = Array.from({ length: this.digitCount }, () => '');
    },

    async updateCandidates() {
      // Worker 呼び出しまたは同期フォールバック
      try {
        const worker = new CandidateWorker();
        worker.postMessage({
          digitCount: this.digitCount,
          history: this.history
        });
        const filtered: string[] = await new Promise((resolve) => {
          worker.onmessage = (e) => {
            resolve(e.data as string[]);
            worker.terminate();
          };
        });
        this.candidates = filtered;
      } catch {
        const all = allCandidatesFast(this.digitCount);
        this.candidates = filterByHistory(all, this.history);
      }
      this.candidatesHistory.push(this.candidates);
    },

    rollbackTo(index: number) {
      this.history = this.history.slice(0, index);
      this.candidates = this.candidatesHistory[index];
      this.candidatesHistory = this.candidatesHistory.slice(0, index + 1);
      this.message = index > 0
        ? `${index+1}回目からやり直します。`
        : '最初からやり直しました。';
    },

    // 追加：対戦履歴にエントリを追加（新しい順）
    addVsHistory(entry: VsHistoryEntry) {
      this.vsHistory.unshift(entry);
    }
  }
});
