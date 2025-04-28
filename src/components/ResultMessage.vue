<template>
  <p v-if="store.message">{{ store.message }}</p>
</template>

<script setup>
import { useGameStore } from "@/stores/game";
const store = useGameStore();
</script>
