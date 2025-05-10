<template>
  <div class="auth">
    <h2>ログイン</h2>
    <form @submit.prevent="onLogin" class="auth-form">
      <input v-model="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">ログイン</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const error = ref<string|null>(null);
const auth = useAuthStore();
const router = useRouter();

async function onLogin() {
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    router.push('/game');
  } catch (e: any) {
    const serverMsg = e.response?.data?.error;
    error.value = serverMsg || e.message || 'ログインに失敗しました';
  }
}
</script>

<style scoped>
.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  gap: 16px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 320px;
  gap: 12px;
}

.auth-form input {
  padding: 8px;
  font-size: 16px;
  border: 1px solid var(--text-color);
  border-radius: 4px;
}

.auth-form button {
  padding: 8px;
  font-size: 16px;
  background-color: var(--primary-color);
  color: var(--bg-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.auth-form button:hover {
  opacity: 0.8;
}

.error {
  color: #e53e3e;
  font-size: 14px;
}
</style>
