// tests/components/HistoryList.spec.js
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { useGameStore } from "@/stores/game";
import HistoryList from "@/components/HistoryList.vue";
import { nextTick } from "vue";
import { describe, it, expect, beforeEach } from "vitest";

describe("HistoryList.vue (C2 coverage)", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useGameStore();
    wrapper = mount(HistoryList);
  });

  it("常に <h2> 『履歴』 ヘッダーが表示される", () => {
    const h2 = wrapper.find("h2");
    expect(h2.exists()).toBe(true);
    expect(h2.text()).toBe("履歴");
  });

  it("初期状態: history が空 → <li> は存在しない", () => {
    store.history = [];
    // 初期で空なので nextTick は不要
    expect(wrapper.findAll("li")).toHaveLength(0);
  });

  it("store.history.push で要素を追加 → 動的に 1 つの <li> がレンダリングされる", async () => {
    store.history.push({ guess: "0000", hit: 0, blow: 0 });
    await nextTick();
    const items = wrapper.findAll("li");
    expect(items).toHaveLength(1);
    expect(items[0].text()).toBe("0000 - 0 Hit, 0 Blow");
  });

  it("history に 1 件代入 → 1 つの <li> が表示される", async () => {
    store.history = [{ guess: "1234", hit: 1, blow: 2 }];
    await nextTick();
    const items = wrapper.findAll("li");
    expect(items).toHaveLength(1);
    expect(items[0].text()).toBe("1234 - 1 Hit, 2 Blow");
  });

  it("history に複数件代入 → 複数の <li> が正しい順序と内容で表示される", async () => {
    store.history = [
      { guess: "1111", hit: 1, blow: 3 },
      { guess: "2222", hit: 2, blow: 2 },
    ];
    await nextTick();
    const items = wrapper.findAll("li");
    expect(items).toHaveLength(2);
    expect(items[0].text()).toBe("1111 - 1 Hit, 3 Blow");
    expect(items[1].text()).toBe("2222 - 2 Hit, 2 Blow");
  });

  it("history を空配列に戻すと <li> がすべて消える", async () => {
    // まず要素をセット
    store.history = [{ guess: "9999", hit: 4, blow: 0 }];
    await nextTick();
    expect(wrapper.findAll("li")).toHaveLength(1);

    // 空に戻す
    store.history = [];
    await nextTick();
    expect(wrapper.findAll("li")).toHaveLength(0);
  });
});
