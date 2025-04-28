// src/stores/game.js
import { defineStore } from "pinia";

function generateSecret() {
  const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
  return Array.from({ length: 4 }, () =>
    numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0]
  ).join("");
}

export const useGameStore = defineStore("game", {
  state: () => ({
    secret: generateSecret(),
    history: [],         // { guess, hit, blow } の配列
    message: "",         // 結果メッセージ
  }),
  actions: {
    reset() {
      this.secret = generateSecret();
      this.history = [];
      this.message = "";
    },
    checkGuess(guess) {
      // バリデーション
      if (!/^\d{4}$/.test(guess) || new Set(guess).size !== 4) {
        this.message = "4桁の異なる数字を入力してください。";
        return;
      }
      // Hit/Blow 計算
      let hit = 0, blow = 0;
      for (let i = 0; i < 4; i++) {
        if (guess[i] === this.secret[i]) hit++;
        else if (this.secret.includes(guess[i])) blow++;
      }
      this.history.push({ guess, hit, blow });
      this.message =
        hit === 4
          ? `正解！秘密の数字は ${this.secret} でした。`
          : `${hit} Hit, ${blow} Blow`;
    },
  },
});
