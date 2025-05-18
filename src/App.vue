<template>
  <div class="container">
    <header class="app-header">
      <h1>Hit & Blow ({{store.digitCount}}桁)</h1>
      <button @click="toggleTheme" class="theme-toggle">{{isDark?'ライト':'ダーク'}}</button>
    </header>

    <div class="mode-select">
      <button :class="{active:mode==='practice'}" @click="mode='practice'">練習</button>
      <button :class="{active:mode==='versus'}"  @click="mode='versus'">対PC</button>
    </div>

    <div class="digit-select">
      <label>桁数:</label>
      <select v-model.number="digitCount" @change="onDigitCountChange">
        <option v-for="n in 10" :key="n" :value="n">{{n}}桁</option>
      </select>
    </div>

    <template v-if="mode==='practice'">
      <GuessInput/><ResultMessage/><HistoryList/>
      <button class="show-cands" @click="show=true">サポート</button>
      <button class="reset"      @click="store.reset()">再スタート</button>
      <CandidateList v-if="show" @close="show=false"/>
      <button class="history-btn" @click="showHistory=!showHistory">
        {{showHistory?'閉じる':'履歴表示'}}
      </button>
      <ResultHistory v-if="showHistory"/>
    </template>

    <template v-else>
      <VsComputer/>
      <button class="history-btn" @click="showVsHistory=!showVsHistory">
        {{showVsHistory?'閉じる':'対戦履歴'}}
      </button>
      <div v-if="showVsHistory" class="vs-history">
        <div class="summary">通算: ○{{wins}} □{{draws}} ●{{losses}}</div>
        <table>
          <thead>
            <tr><th>日時</th><th>桁数</th><th>結果</th><th>手数</th><th>あなたの秘密</th><th>PCの秘密</th></tr>
          </thead>
          <tbody>
            <tr v-for="(h,i) in store.vsHistory" :key="i">
              <td>{{formatDate(h.playedAt)}}</td>
              <td>{{h.digitCount}}桁</td>
              <td>{{h.result==='win'?'○':h.result==='draw'?'□':'●'}}</td>
              <td>{{h.userAttempts}}</td>
              <td>{{h.userSecret}}</td>
              <td>{{h.compSecret}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameStore } from '@/stores/game';
import { useSettingsStore } from '@/stores/settings';
import CandidateList  from '@/components/CandidateList.vue';
import GuessInput     from '@/components/GuessInput.vue';
import ResultMessage  from '@/components/ResultMessage.vue';
import HistoryList    from '@/components/HistoryList.vue';
import ResultHistory  from '@/components/ResultHistory.vue';
import VsComputer     from '@/components/VsComputer.vue';

const store = useGameStore();
const settings = useSettingsStore();

const mode = ref<'practice'|'versus'>('practice');
const show = ref(false);
const showHistory   = ref(false);
const showVsHistory = ref(false);
const digitCount = ref(store.digitCount);
const isDark     = computed(()=>settings.theme==='dark');

onMounted(()=>applyTheme(settings.theme));
watch(()=>settings.theme, t=>applyTheme(t));
watch(digitCount,v=>store.setDigitCount(v));

function onDigitCountChange(){store.setDigitCount(digitCount.value);}
function toggleTheme(){settings.toggleTheme();}
function applyTheme(t:'light'|'dark'){document.documentElement.setAttribute('data-theme',t);}

// 通算勝敗カウント
const wins   = computed(()=>store.vsHistory.filter(h=>h.result==='win').length);
const draws  = computed(()=>store.vsHistory.filter(h=>h.result==='draw').length);
const losses = computed(()=>store.vsHistory.filter(h=>h.result==='lose').length);

// 日時フォーマット (日本時間, 24h)
function formatDate(iso:string){
  return new Date(iso).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo',hour12:false});
}
</script>

<style>
.container { text-align:center; padding:20px; min-height:100vh; }
.app-header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.theme-toggle{ padding:6px 12px; border:none; border-radius:4px; cursor:pointer; }
.mode-select{ display:flex; justify-content:center; gap:8px; margin-bottom:16px; }
.mode-select button{ padding:6px 12px; border:none; border-radius:4px; cursor:pointer; }
.mode-select .active{ background:var(--primary-color); color:var(--bg-color); }
.digit-select{ margin-bottom:16px; }
.digit-select label{ font-weight:bold; margin-right:8px; }
.digit-select select{ padding:4px 8px; }
.show-cands, .reset, .history-btn{ margin-top:20px; padding:8px 16px; border:none; border-radius:4px; cursor:pointer; }
.show-cands{ background:#007bff;color:#fff; } .show-cands:hover{ background:#0056b3; }
.reset, .history-btn{ background:var(--primary-color);color:var(--bg-color); }
.vs-history{ margin-top:16px; text-align:left; overflow-x:auto; }
.vs-history .summary{ margin-bottom:8px; font-weight:bold; }
.vs-history table{ width:100%; border-collapse:collapse; font-size:14px; }
.vs-history th,td{ border:1px solid #ccc; padding:6px; }
.vs-history th{ background:var(--primary-color); color:var(--bg-color); }
</style>
