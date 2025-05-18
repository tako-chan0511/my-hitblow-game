<template>
  <div class="vs-history">
    <h2>対戦履歴</h2>
    <table>
      <thead>
        <tr>
          <th>日時</th>
          <th>桁数</th>
          <th>結果</th>
          <th>あなたの解答回数</th>
          <th>コンピュータの解答回数</th>
          <th>あなたの秘密</th>
          <th>コンピュータの秘密</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(h, i) in store.vsHistory" :key="i">
          <td>{{ new Date(h.playedAt).toLocaleString() }}</td>
          <td>{{ h.digitCount }}</td>
          <td>{{ h.result === 'win' ? '勝ち' : h.result === 'lose' ? '負け' : '引き分け' }}</td>
          <td>{{ h.userAttempts }}</td>
          <td>{{ h.compAttempts }}</td>
          <td>{{ h.userSecret }}</td>
          <td>{{ h.compSecret }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
const store = useGameStore();
</script>

<style scoped>
.vs-history table {
  width: 100%;
  border-collapse: collapse;
}
.vs-history th, .vs-history td {
  border: 1px solid #ccc;
  padding: 4px 8px;
  text-align: center;
}
</style>
