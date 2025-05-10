<template>
  <div class="auth">
    <h2>新規登録</h2>
    <!-- ① <form> を使い、action属性は指定しない -->
    <form @submit.prevent="onRegister">
      <input v-model="email"    placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const email    = ref('');
const password = ref('');
const error    = ref<string|null>(null);
const auth     = useAuthStore();
const router   = useRouter();

async function onRegister() {
  error.value = null;
  try {
    // ここで Axios 経由で /api/auth/register を呼ぶ
    await auth.register(email.value, password.value);
    router.push('/login');
  } catch (e: any) {
    //error.value = e.message || '登録に失敗しました';
    // サーバーが返す JSON の error プロパティを優先表示
    console.error('register error(RegiterView.vue):', e);
    const serverMsg = e.response?.data?.error;
    error.value = serverMsg || e.message || '登録に失敗しました';
  }
}
</script>
