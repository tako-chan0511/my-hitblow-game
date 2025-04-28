<template>
    <div class="guess-input">
      <input
        v-model="value"
        maxlength="4"
        @keyup.enter="onSubmit"
        placeholder="0123"
      />
      <button @click="onSubmit">判定</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useGameStore } from "@/stores/game";
  
  const store = useGameStore();
  const value = ref("");
  
  function onSubmit() {
    store.checkGuess(value.value);
    value.value = "";
  }
  </script>
  
  <style scoped>
  .guess-input input {
    padding: 5px;
    font-size: 18px;
    text-align: center;
  }
  .guess-input button {
    margin-left: 10px;
    padding: 5px 10px;
    font-size: 18px;
  }
  </style>
  