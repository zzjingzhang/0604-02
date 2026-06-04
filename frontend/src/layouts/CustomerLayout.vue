<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <span class="text-2xl font-bold text-blue-600">🚗 汽车维修预约</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="$route.path === item.path ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
            >
              {{ item.name }}
            </router-link>
          </div>

          <div class="flex items-center space-x-4">
            <span class="text-gray-600">欢迎，{{ userStore.userInfo?.username }}</span>
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();

const menuItems = [
  { name: '维修项目', path: '/customer/services' },
  { name: '在线预约', path: '/customer/appointment' },
  { name: '预约记录', path: '/customer/appointments' },
  { name: '维修进度', path: '/customer/progress' }
];

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>
