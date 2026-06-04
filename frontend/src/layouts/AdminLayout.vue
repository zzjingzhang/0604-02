<template>
  <div class="min-h-screen bg-gray-100 flex">
    <aside class="w-64 bg-gray-800 text-white">
      <div class="p-6">
        <h1 class="text-xl font-bold">🔧 管理后台</h1>
      </div>
      
      <nav class="mt-6">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-6 py-3 hover:bg-gray-700 transition-colors"
          :class="$route.path === item.path ? 'bg-gray-700 border-l-4 border-blue-500' : ''"
        >
          <span class="mr-3">{{ item.icon }}</span>
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col">
      <header class="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-800">{{ currentPageName }}</h2>
        <div class="flex items-center space-x-4">
          <span class="text-gray-600">管理员：{{ userStore.userInfo?.username }}</span>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            退出
          </button>
        </div>
      </header>

      <main class="flex-1 p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const menuItems = [
  { name: '仪表盘', path: '/admin/dashboard', icon: '📊' },
  { name: '预约管理', path: '/admin/appointments', icon: '📅' },
  { name: '预约排期', path: '/admin/schedule', icon: '⏰' },
  { name: '工单管理', path: '/admin/work-orders', icon: '📋' },
  { name: '技师管理', path: '/admin/technicians', icon: '👨‍🔧' },
  { name: '服务项目', path: '/admin/services', icon: '🔧' }
];

const currentPageName = computed(() => {
  const item = menuItems.find(m => m.path === route.path);
  return item?.name || '';
});

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>
