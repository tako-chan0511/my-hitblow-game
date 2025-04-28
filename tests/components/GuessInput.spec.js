// tests/components/GuessInput.spec.js
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { useGameStore } from "@/stores/game";
import GuessInput from "@/components/GuessInput.vue";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("GuessInput.vue (C2 coverage)", () => {
  beforeEach(() => {
    // 毎テストごとに新しい Pinia ストアをセット
    setActivePinia(createPinia());
  });

  it("初期レンダリング: root に .guess-input があり、input/button に正しい属性が設定されている", () => {
    const wrapper = mount(GuessInput);
    const input = wrapper.get("input");
    const button = wrapper.get("button");

    expect(wrapper.classes()).toContain("guess-input");
    expect(input.attributes("maxlength")).toBe("4");
    expect(input.attributes("placeholder")).toBe("0123");
    expect(button.text()).toBe("判定");
  });

  it("v-model によって input の value が更新される", async () => {
    const wrapper = mount(GuessInput);
    const input = wrapper.get("input");

    await input.setValue("7890");
    expect(input.element.value).toBe("7890");
  });

  it("ボタンクリックで store.checkGuess が呼ばれ、input がリセットされる", async () => {
    const wrapper = mount(GuessInput);
    const input = wrapper.get("input");
    const store = useGameStore();
    const spy = vi.spyOn(store, "checkGuess");

    await input.setValue("5678");
    await wrapper.get("button").trigger("click");

    expect(spy).toHaveBeenCalledWith("5678");
    expect(input.element.value).toBe("");
  });

  it("Enterキーで store.checkGuess が呼ばれ、input がリセットされる", async () => {
    const wrapper = mount(GuessInput);
    const input = wrapper.get("input");
    const store = useGameStore();
    const spy = vi.spyOn(store, "checkGuess");

    await input.setValue("1234");
    await input.trigger("keyup.enter");

    expect(spy).toHaveBeenCalledWith("1234");
    expect(input.element.value).toBe("");
  });

  it("連続して submit しても常に最新の入力値が渡される", async () => {
    const wrapper = mount(GuessInput);
    const input = wrapper.get("input");
    const store = useGameStore();
    const spy = vi.spyOn(store, "checkGuess");

    // 1 回目
    await input.setValue("0001");
    await wrapper.get("button").trigger("click");
    expect(spy).toHaveBeenCalledWith("0001");

    // 2 回目
    await input.setValue("2222");
    await wrapper.get("button").trigger("click");
    expect(spy).toHaveBeenCalledWith("2222");
  });

  it("空文字で submit しても store.checkGuess が呼ばれる（'' が渡される）", async () => {
    const wrapper = mount(GuessInput);
    const store = useGameStore();
    const spy = vi.spyOn(store, "checkGuess");

    await wrapper.get("button").trigger("click");
    expect(spy).toHaveBeenCalledWith("");

    // input はやはり空のまま
    const input = wrapper.get("input");
    expect(input.element.value).toBe("");
  });
});
