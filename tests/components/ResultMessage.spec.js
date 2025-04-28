// tests/components/ResultMessage.spec.js
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { useGameStore } from "@/stores/game";
import ResultMessage from "@/components/ResultMessage.vue";
import { nextTick } from "vue";
import { describe, it, expect, beforeEach } from "vitest";

describe("ResultMessage.vue (C2 coverage)", () => {
  beforeEach(() => {
    // 毎テストごとに新しい Pinia ストアを準備
    setActivePinia(createPinia());
  });

  it("store.message が空文字のとき <p> はレンダリングされない", () => {
    const wrapper = mount(ResultMessage);
    expect(wrapper.find("p").exists()).toBe(false);
  });

  it("store.message に文字列をセットすると <p> が表示される", async () => {
    const store = useGameStore();
    store.message = "テストメッセージ";

    const wrapper = mount(ResultMessage);
    await nextTick();

    const p = wrapper.find("p");
    expect(p.exists()).toBe(true);
    expect(p.text()).toBe("テストメッセージ");
  });

  it("store.message を空に戻すと <p> が削除される", async () => {
    const store = useGameStore();
    // 初期は空 → 表示なし
    const wrapper = mount(ResultMessage);
    expect(wrapper.find("p").exists()).toBe(false);

    // メッセージ設定 → 表示あり
    store.message = "一時メッセージ";
    await nextTick();
    expect(wrapper.find("p").exists()).toBe(true);

    // 再びクリア → 非表示
    store.message = "";
    await nextTick();
    expect(wrapper.find("p").exists()).toBe(false);
  });

  it("HTML タグを含むメッセージはエスケープして表示される", async () => {
    const store = useGameStore();
    store.message = "<b>bold</b>";

    const wrapper = mount(ResultMessage);
    await nextTick();

    // .html() でタグがエスケープされていることを確認
    expect(wrapper.html()).toContain("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("文字列 '0' をセットしても <p> が表示される", async () => {
    const store = useGameStore();
    store.message = "0";

    const wrapper = mount(ResultMessage);
    await nextTick();

    const p = wrapper.find("p");
    expect(p.exists()).toBe(true);
    expect(p.text()).toBe("0");
  });
});
