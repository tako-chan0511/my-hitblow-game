<template>
  <div class="history-container">
    <!-- インゲーム履歴表示 -->
    <div v-if="!props.completed">
      <div class="history-header">
        <h2>履歴</h2>
        <button class="show-cands-small" @click="$emit('show-candidates')">
          残り候補
        </button>
      </div>
      <ul>
        <li v-for="(entry, i) in store.history" :key="i" class="entry">
          {{ i + 1 }}回目: {{ entry.guess }} - {{ entry.hit }} Hit, {{ entry.blow }} Blow
          <span class="remaining">
            残り候補: {{ store.remainingCandidatesAt(i).length }}
          </span>
          <button @click="confirmRollback(i)">↓ ここ以降を取り消す</button>
        </li>
      </ul>
    </div>

    <!-- 完了ゲーム履歴表示 -->
    <div v-else>
      <h2>完了ゲーム履歴</h2>
      <table class="history-table">
        <thead>
          <tr>
            <th>桁数</th>
            <th>回数</th>
            <th>実施時間</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td>{{ record.digitCount }}</td>
            <td>{{ record.attempts }}</td>
            <td>{{ formatDate(record.finishedAt) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="records.length === 0" class="no-history">履歴がありません</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { useGameStore } from '@/stores/game';
import type { GameState } from '@/stores/game';
import { fetchCompletedHistory } from '@/api';

// completed: true なら DB の完了履歴表示、false ならゲーム中履歴表示
const props = defineProps<{ completed?: boolean }>();
const emit = defineEmits<{ (e: 'show-candidates'): void }>();
// ゲーム中履歴用ストア
const store = useGameStore() as GameState & { rollbackTo: (index: number) => void };

// 完了履歴用データ
interface HistoryRecord {
  id: number;
  digitCount: number;
  attempts: number;
  finishedAt: string;
}
const records = ref<HistoryRecord[]>([]);

if (props.completed) {
  onMounted(async () => {
    try {
      const res = await fetchCompletedHistory();
      records.value = res.data;
    } catch (err) {
      console.error('完了履歴取得に失敗しました', err);
    }
  });
}

function formatDate(iso: string): string {
  // 日本時間で表示
  return new Date(iso).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

function confirmRollback(index: number) {
  const label =
    index > 0 ? `${index + 1}回目からやり直しますか？` : '最初からやり直しますか？';
  if (confirm(`${label}\n以降の履歴は削除されます。`)) {
    store.rollbackTo(index);
  }
}
</script>

<style scoped>
.history-container {
  text-align: center;
}
.history-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}
.history-header h2 {
  margin: 0;
}

.show-cands-small {
  padding: 4px 8px;
  font-size: 14px;
  background: var(--primary-color);
  color: var(--bg-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.show-cands-small:hover {
  opacity: 0.8;
}

ul {
  display: inline-block;
  text-align: left;
  list-style: none;
  padding: 0;
  margin: 0;
}
.entry {
  margin: 8px 0;
  font-family: monospace;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
button {
  margin-left: 12px;
  font-size: 0.9em;
  padding: 2px 6px;
}

/* 完了履歴用テーブル */
.history-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 auto;
}
.history-table th {
  /* ヘッダー背景をテーマの背景色に合わせる */
  background-color: var(--bg-color);
}
.history-table th,
.history-table td {
  padding: 8px;
  border-bottom: 1px solid var(--border-color, #ddd);
  text-align: center;
  /* テキスト色をテーマのテキストカラーに */
  color: var(--text-color);
}
.no-history {
  margin-top: 16px;
  color: var(--text-color);
}
</style>
