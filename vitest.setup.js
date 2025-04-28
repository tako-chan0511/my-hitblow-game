// vitest.setup.js
import { beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";

// 各テストの前にテスト用 Pinia を用意
beforeEach(() => {
  createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
  });
});
