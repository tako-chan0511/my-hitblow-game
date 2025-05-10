<template>
  <div>
    <h2>プレイ履歴</h2>
    <p v-if="results.length === 0">まだ履歴がありません。</p>
    <table v-else>
      <colgroup>
        <!-- 操作列：1文字相当 -->
        <col style="width:1ch;" />
        <!-- 桁数列：2文字相当 -->
        <col style="width:2ch;" />
        <!-- 回数列：2文字相当 -->
        <col style="width:2ch;" />
        <!-- 時間列：10文字相当 -->
        <col style="width:10ch;" />
        <!-- 日時列：20文字相当 -->
        <col style="width:20ch;" />
      </colgroup>
      <thead>
        <tr>
          <th>操作</th>
          <th>桁数</th>
          <th>回数</th>
          <th>時間 (秒)</th>
          <th>日時</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in results" :key="row.id">
          <td>
            <button class="del-btn" @click="onDelete(row.id)">削除</button>
          </td>
          <td>{{ row.digit_count }}</td>
          <td>{{ row.attempts }}</td>
          <td>{{ (row.elapsed_ms / 1000).toFixed(2) }}</td>
          <td>{{ new Date(row.played_at).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchResults, deleteResult } from '@/lib/db';

type Result = {
  id: number;
  digit_count: number;
  attempts: number;
  elapsed_ms: number;
  played_at: string;
};

const results = ref<Result[]>([]);

async function load() {
  results.value = await fetchResults();
}

onMounted(load);

async function onDelete(id: number) {
  if (!confirm('本当にこの履歴を削除しますか？')) return;
  await deleteResult(id);
  await load();
}
</script>

<style scoped>
/* テーブルを内容幅に合わせ固定レイアウト & 中央配置 */
table {
  border-collapse: collapse;
  margin: 16px auto 0 auto;
  table-layout: fixed;
}
/* すべてのセルをタイトに */
th, td {
  border: 1px solid var(--text-color);
  padding: 2px 4px;
  font-size: 0.85em;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.del-btn {
  padding: 2px 4px;
  font-size: 0.8em;
  background-color: #e53e3e;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.del-btn:hover {
  opacity: 0.8;
}
</style>
