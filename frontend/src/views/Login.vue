<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">汽车维修预约系统</h1>
        <p class="text-gray-500 mt-2">欢迎回来，请登录您的账户</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="请输入密码"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          还没有账户？
          <router-link to="/register" class="text-blue-600 hover:underline font-medium">
            立即注册
          </router-link>
        </p>
      </div>

      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-500 mb-2">测试账号：</p>
        <p class="text-sm text-gray-600">顾客：customer@example.com / 123456</p>
        <p class="text-sm text-gray-600">商家：admin@example.com / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { login } from '@/api/auth';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  email: '',
  password: ''
});

const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    const res: any = await login(form.value);
    userStore.setToken(res.token);
    userStore.setUserInfo(res.user);
    
    if (res.user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/customer/services');
    }
  } catch (error: any) {
    alert(error.response?.data?.message || '登录失败');
  } finally {
    loading.value = false;
  }
};
</script>
