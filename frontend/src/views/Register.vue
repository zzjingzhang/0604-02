<template>
  <div class="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">注册账户</h1>
        <p class="text-gray-500 mt-2">创建您的汽车维修预约账户</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="请输入邮箱"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">手机号</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="请输入手机号"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="请输入密码"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">账户类型</label>
          <select
            v-model="form.role"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          >
            <option value="customer">顾客</option>
            <option value="admin">商家</option>
          </select>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          已有账户？
          <router-link to="/login" class="text-green-600 hover:underline font-medium">
            立即登录
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';
import { register } from '@/api/auth';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'customer'
});

const loading = ref(false);

const handleRegister = async () => {
  try {
    loading.value = true;
    const res: any = await register(form.value);
    userStore.setToken(res.token);
    userStore.setUserInfo(res.user);
    
    if (res.user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/customer/services');
    }
  } catch (error: any) {
    alert(error.response?.data?.message || '注册失败');
  } finally {
    loading.value = false;
  }
};
</script>
