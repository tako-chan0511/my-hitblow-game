// tests/game.spec.js
import { setActivePinia, createPinia } from "pinia";
import { useGameStore } from "@/stores/game";

describe("game store (branch coverage – C1)", () => {
  let store;

  beforeEach(() => {
    // 毎回新しい Pinia とストアを作成
    setActivePinia(createPinia());
    store = useGameStore();
  });

  it("初期状態: history=[], message='', secret は 4 桁", () => {
    expect(store.history).toEqual([]);
    expect(store.message).toBe("");
    expect(store.secret).toMatch(/^\d{4}$/);
  });

  it("reset() で状態がクリアされる", () => {
    // 状態をいじる
    store.history.push({ guess: "1234", hit: 1, blow: 2 });
    store.message = "テスト";
    store.secret = "0000";
    // リセット
    store.reset();
    expect(store.history).toEqual([]);
    expect(store.message).toBe("");
    expect(store.secret).toMatch(/^\d{4}$/);
    // 新しい secret は以前と必ず異なるとは限らないので長さと形式のみチェック
  });

  describe("バリデーション分岐", () => {
    it("数字以外の文字列 → NG メッセージ、history に追加されない", () => {
      store.checkGuess("ab!@");
      expect(store.message).toBe("4桁の異なる数字を入力してください。");
      expect(store.history).toHaveLength(0);
    });

    it("桁数が 4 でない → NG", () => {
      store.checkGuess("123");
      expect(store.message).toBe("4桁の異なる数字を入力してください。");
      expect(store.history).toHaveLength(0);
    });

    it("数字は 4 桁だが重複あり → NG", () => {
      store.checkGuess("1123");
      expect(store.message).toBe("4桁の異なる数字を入力してください。");
      expect(store.history).toHaveLength(0);
    });
  });

  describe("Hit/Blow 算出分岐", () => {
    beforeEach(() => {
      // テストごとに secret を固定
      store.secret = "1234";
    });

    it("ヒットもブローも 0 → history に {0,0} が追加", () => {
      store.checkGuess("5678");
      expect(store.history).toHaveLength(1);
      expect(store.history[0]).toEqual({ guess: "5678", hit: 0, blow: 0 });
      expect(store.message).toBe("0 Hit, 0 Blow");
    });

    it("全て Blow (順不同) → {0 Hit, 4 Blow}", () => {
      store.checkGuess("4321");
      expect(store.history[0]).toEqual({ guess: "4321", hit: 0, blow: 4 });
      expect(store.message).toBe("0 Hit, 4 Blow");
    });

    it("全て Hit → 正解メッセージ", () => {
      store.checkGuess("1234");
      expect(store.history[0]).toEqual({ guess: "1234", hit: 4, blow: 0 });
      expect(store.message).toContain("正解！秘密の数字は 1234 でした。");
    });

    it("Hit と Blow が混在 → {2 Hit, 1 Blow}", () => {
      // 例: 1,2 は正位置 (Hit)、3 は別位置 (Blow)、0 は無視
      store.checkGuess("1203");
      expect(store.history[0]).toEqual({ guess: "1203", hit: 2, blow: 1 });
      expect(store.message).toBe("2 Hit, 1 Blow");
    });

    it("Hit のみ → {2 Hit, 0 Blow}", () => {
      // 1,2 が正位置、それ以外は対象外
      store.checkGuess("1209");
      expect(store.history[0]).toEqual({ guess: "1209", hit: 2, blow: 0 });
      expect(store.message).toBe("2 Hit, 0 Blow");
    });

    it("Blow のみ → {0 Hit, 4 Blow}", () => {
      // 1,2 は別位置
      store.checkGuess("4123");
      expect(store.history[0]).toEqual({ guess: "4123", hit: 0, blow: 4 });
      expect(store.message).toBe("0 Hit, 4 Blow");
    });
  });
});
